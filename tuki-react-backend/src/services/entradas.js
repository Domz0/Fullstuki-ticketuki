import { mismaSesion } from "../utils/controlSesion";
import { peticionApi } from "./api";
import { cargarDetalleEvento } from "./eventos";
import { leerSesion } from "../utils/sesion";

export function devolverEntrada(id) {
  const { token } = leerSesion();
  return peticionApi(`/tickets/${id}/devolver`, { method: "POST", token });
}

export async function cargarMisEntradas(rut, signal) {
  const { token } = leerSesion();
  const tickets = await peticionApi(`/tickets/titular/${encodeURIComponent(rut)}`, { token, signal });
  if (!Array.isArray(tickets)) {
    throw new Error("No se pudieron interpretar tus entradas.");
  }


  const idsEventos = [...new Set(tickets.map(ticket => ticket.evento_id_evento))];
  const detallesEventos = await Promise.all(
    idsEventos.map(id => cargarDetalleEvento(id, signal)),
  );

  signal?.throwIfAborted();
  if (!mismaSesion(leerSesion(), token)) {
    throw new Error("La sesión cambió. Vuelve a cargar tus entradas.");
  }

  const hoy = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Santiago" }).format(new Date());
  const entradas = tickets.map(ticket => {
    const indiceEvento = idsEventos.indexOf(ticket.evento_id_evento);
    const { evento, sectores } = detallesEventos[indiceEvento];
    return adaptarEntrada(ticket, evento, sectores, hoy);
  });
  return entradas.sort((primera, segunda) => segunda.id - primera.id);
}

function adaptarEntrada(ticket, evento, sectores, hoy) {
  const sector = sectores.find(item => item.id_sector === ticket.sector_id_sector);
  const estadoTicket = ticket.estado_ticket_id_estado;
  const fechaPasada = evento?.fecha_evento && evento.fecha_evento < hoy;
  const cancelada = estadoTicket === 3 || evento?.estado_evento_id_estado === 3;
  const finalizada = fechaPasada || evento?.estado_evento_id_estado === 4;

  let estado = "otras";
  if (cancelada) {
    estado = "canceladas";
  } else if (estadoTicket === 2 || finalizada) {
    estado = "pasadas";
  } else if (evento && [1, 4].includes(estadoTicket)) {
    estado = "proximas";
  }

  let rotulo = "Estado por confirmar";
  if (cancelada) {
    rotulo = "Cancelada";
  } else if (estadoTicket === 2) {
    rotulo = "Utilizada";
  } else if (finalizada) {
    rotulo = "Evento pasado";
  } else if (estadoTicket === 4) {
    rotulo = "Entrada recibida";
  } else if (estadoTicket === 1) {
    rotulo = "Válida";
  }

  let fecha = "Fecha por confirmar";
  if (evento) {
    fecha = evento.fecha_visible || [evento.fecha_evento, evento.horario].filter(Boolean).join(" · ");
  }

  return {
    id: ticket.id_ticket,
    eventoId: ticket.evento_id_evento,
    estado,
    rotulo,
    transferible: estado === "proximas" && evento?.estado_evento_id_estado === 2 && Boolean(evento?.fecha_evento),
    devolvible: [1, 4].includes(estadoTicket) && Boolean(evento?.fecha_evento) && !finalizada,
    nombre: evento?.nombre_evento || `Evento ${ticket.evento_id_evento}`,
    recinto: evento?.recinto_catalogo || "Recinto por confirmar",
    fecha,
    sector: sector?.nombre_sector || `Sector ${ticket.sector_id_sector}`,
    codigo: ticket.cod_qr,
    orden: `TKI-${ticket.venta_id_venta}`,
    titular: ticket.nombre_titular,
    detalleIncompleto: !evento || !sector,
  };
}
