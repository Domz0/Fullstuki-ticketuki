import { peticionApi } from "./api";
import { eventoConcluido } from "../utils/estadoEvento";

const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// mes, año fechaa
function partesFecha(fecha) {
  const [anio, mes, dia] = (fecha || "").split("-");
  if (!anio || !mes || !dia) return { dia: "", mes: "", anio: "" };
  return { dia: String(Number(dia)), mes: meses[Number(mes) - 1] || "", anio };
}

const estadosEvento = {
  1: "Agendado",
  2: "Disponible",
  3: "Cancelado",
  4: "Finalizado",
};

// pasa los nombres de la api a componentes
export function adaptarEvento(evento) {
  const recinto = evento.recinto_catalogo || "Recinto por confirmar";
  const horario = evento.horario || "";
  const fecha = evento.fecha_evento;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const yaPaso = Boolean(fecha && new Date(`${fecha}T00:00:00`) < hoy);
  const estado = estadosEvento[evento.estado_evento_id_estado] || "Por confirmar";
  const fechaVisible = evento.fecha_visible || [fecha, horario].filter(Boolean).join(", ");

  return {
    id: evento.id_evento,
    destacado: Boolean(evento.destacado),
    nombre: evento.nombre_evento,
    categoria: evento.categoria || "musica",
    subcategoria: evento.subcategoria || "Otros",
    ciudad: evento.ciudad || "Por confirmar",
    recinto,
    precio: evento.precio_desde,
    descripcion: evento.descripcion,
    estado: yaPaso ? "Este evento ya pasó" : estado,
    yaPaso,
    plazo: evento.plazo || 3,
    fechaInicio: fecha ? `${fecha}T${horario || "00:00"}:00` : undefined,
    detalle: `${recinto} · ${fechaVisible}`,
    fechas: [{
      id: "principal",
      ...partesFecha(fecha),
      horario,
      estado,
    }],
  };
}

export async function cargarCatalogo() {
  const datos = await peticionApi("/eventos");
  if (!Array.isArray(datos)) {
    throw new Error("No se pudo interpretar el catálogo del servidor.");
  }

  const eventosVigentes = datos.filter(evento => !eventoConcluido(evento));
  return Promise.all(eventosVigentes.map(cargarEventoDelCatalogo));
}

async function cargarEventoDelCatalogo(datos) {
  const evento = adaptarEvento(datos);
  try {
    const resumen = await cargarDisponibilidad(evento.id);
    return aplicarDisponibilidad(evento, resumen);
  } catch {
    // si hay fallos con el stock lo muestra y no hay venta
    return {
      ...evento,
      estado: evento.yaPaso ? "Este evento ya pasó" : "Disponibilidad no disponible",
      ventaHabilitada: false,
    };
  }
}

export async function cargarDisponibilidad(id) {
  const resumen = await peticionApi(`/tickets/disponibilidad/evento/${id}`);
  if (!Array.isArray(resumen?.sectores) || !Number.isFinite(resumen.disponibles)) {
    throw new Error("No se pudo consultar la disponibilidad del evento.");
  }
  return resumen;
}

function aplicarDisponibilidad(evento, resumen) {
  const estados = {
    AGOTADO: "Agotado",
    DISPONIBLE: "Disponible",
    NO_DISPONIBLE: "Venta no habilitada",
    SIN_CONFIGURAR: "Sin sectores habilitados",
  };
  const estado = evento.yaPaso ? "Este evento ya pasó" : estados[resumen.estado] || "Por confirmar";
  const ventaHabilitada = resumen.venta_habilitada && !evento.yaPaso;
  const precios = resumen.sectores
    .filter(sector => sector.capacidad > 0)
    .map(sector => sector.precio);
  const sectores = resumen.sectores.map(sector => ({
    ...sector,
    planoId: sector.plano_id,
    bloqueado: !ventaHabilitada || sector.capacidad === 0,
    estado: sector.disponibles === 0 ? "agotada" : "disponible",
  }));

  return {
    ...evento,
    estado,
    capacidadTotal: resumen.capacidad_total,
    disponibles: resumen.disponibles,
    ventaHabilitada,
    precio: precios.length ? Math.min(...precios) : null,
    fechas: evento.fechas.map(fecha => ({ ...fecha, estado })),
    sectores,
  };
}

// el detalle consulta al evento y disponibilidad en el backend
export async function cargarEventoDisponible(id) {
  const eventoId = id === "destacado" ? 1 : id;
  const [datos, resumen] = await Promise.all([
    peticionApi(`/eventos/${eventoId}`),
    cargarDisponibilidad(eventoId),
  ]);
  return aplicarDisponibilidad(adaptarEvento(datos), resumen);
}

// aunque falle algun dato, entradas e historial conservan sus registros
export async function cargarDetalleEvento(id, signal) {
  const [respuestaEvento, respuestaSectores] = await Promise.allSettled([
    peticionApi(`/eventos/${id}`, { signal }),
    peticionApi(`/eventos/${id}/sectores`, { signal }),
  ]);
  signal?.throwIfAborted();

  let evento = null;
  let sectores = [];
  if (respuestaEvento.status === "fulfilled") {
    evento = respuestaEvento.value;
  }
  if (respuestaSectores.status === "fulfilled" && Array.isArray(respuestaSectores.value)) {
    sectores = respuestaSectores.value;
  }
  return { evento, sectores };
}
