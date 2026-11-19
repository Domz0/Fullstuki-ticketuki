import { peticionApi } from "./api";
import { leerSesion } from "../utils/sesion";

export async function devolverEntrada(id) {
  return peticionApi(`/tickets/${id}/devolver`, { method: "POST", token: leerSesion().token });
}

export async function cargarMisEntradas(rut, signal) {
  const { token } = leerSesion();
  const tickets = await peticionApi(`/tickets/titular/${encodeURIComponent(rut)}`, { token, signal });
  if (!Array.isArray(tickets)) throw new Error("No se pudieron interpretar tus entradas.");
  const ids = [...new Set(tickets.map(ticket => ticket.evento_id_evento))];
  const eventos = new Map(await Promise.all(ids.map(async id => {
    const [evento, sectores] = await Promise.allSettled([
      peticionApi(`/eventos/${id}`, { signal }),
      peticionApi(`/eventos/${id}/sectores`, { signal }),
    ]);
    return [id, { evento: evento.status === "fulfilled" ? evento.value : null,
      sectores: sectores.status === "fulfilled" && Array.isArray(sectores.value) ? sectores.value : [] }];
  })));
  signal?.throwIfAborted();
  if (leerSesion().token !== token) throw new Error("La sesión cambió. Vuelve a cargar tus entradas.");
  const hoy = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Santiago" }).format(new Date());
  return tickets.map(ticket => {
    const { evento, sectores } = eventos.get(ticket.evento_id_evento);
    const sector = sectores.find(item => item.id_sector === ticket.sector_id_sector);
    const estadoTicket = ticket.estado_ticket_id_estado;
    const pasada = evento?.fecha_evento && evento.fecha_evento < hoy;
    const cancelada = estadoTicket === 3 || evento?.estado_evento_id_estado === 3;
    const finalizada = pasada || evento?.estado_evento_id_estado === 4;
    const estado = cancelada ? "canceladas" : estadoTicket === 2 || finalizada ? "pasadas"
      : evento && [1, 4].includes(estadoTicket) ? "proximas" : "otras";
    const rotulo = cancelada ? "Cancelada" : estadoTicket === 2 ? "Utilizada" : finalizada ? "Evento pasado"
      : estadoTicket === 4 ? "Entrada recibida" : estadoTicket === 1 ? "Válida" : "Estado por confirmar";
    return { id: ticket.id_ticket, eventoId: ticket.evento_id_evento, estado, rotulo,
      transferible: estado === "proximas" && evento?.estado_evento_id_estado === 2 && Boolean(evento?.fecha_evento),
      devolvible: [1, 4].includes(estadoTicket) && Boolean(evento?.fecha_evento) && !finalizada,
      nombre: evento?.nombre_evento || `Evento ${ticket.evento_id_evento}`,
      recinto: evento?.recinto_catalogo || "Recinto por confirmar",
      fecha: evento ? [evento.fecha_visible || evento.fecha_evento, !evento.fecha_visible && evento.horario].filter(Boolean).join(" · ") : "Fecha por confirmar",
      sector: sector?.nombre_sector || `Sector ${ticket.sector_id_sector}`,
      codigo: ticket.cod_qr, orden: `TKI-${ticket.venta_id_venta}`, titular: ticket.nombre_titular,
      detalleIncompleto: !evento || !sector,
    };
  }).sort((a, b) => b.id - a.id);
}
