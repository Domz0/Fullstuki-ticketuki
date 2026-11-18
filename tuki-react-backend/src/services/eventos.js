import { peticionApi } from "./api";

export function adaptarEvento(evento) {
  const recinto = evento.recinto_catalogo || "Recinto por confirmar";
  const horario = evento.horario || "";
  const fecha = evento.fecha_evento;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const yaPaso = Boolean(fecha && new Date(`${fecha}T00:00:00`) < hoy);
  const estado = { 3: "Cancelado", 4: "Finalizado" }[evento.estado_evento_id_estado]
    || { 1: "Agendado", 2: "Disponible" }[evento.estado_evento_id_estado] || "Por confirmar";
  return {
    id: evento.id_evento,
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
    detalle: `${recinto} · ${evento.fecha_visible || [fecha, horario].filter(Boolean).join(", ")}`,
    fechas: [{ id: "principal", dia: fecha?.slice(8) || "", mes: fecha?.slice(0, 7) || "", horario, estado }],
  };
}

export async function cargarCatalogo() {
  const datos = await peticionApi("/eventos");
  if (!Array.isArray(datos)) throw new Error("No se pudo interpretar el catálogo del servidor.");
  const eventos = await Promise.all(datos.map(async dato => {
    const evento = adaptarEvento(dato);
    try {
      const resumen = await cargarDisponibilidad(evento.id);
      return aplicarDisponibilidad(evento, resumen);
    } catch {
      return { ...evento, estado: evento.yaPaso ? "Este evento ya pasó" : "Disponibilidad no disponible", ventaHabilitada: false };
    }
  }));
  // Conserva los datos del evento para el resumen de la selección.
  try { sessionStorage.setItem("catalogoBackend", JSON.stringify(eventos)); } catch { /* El listado sigue disponible. */ }
  return eventos;
}

export async function cargarDisponibilidad(id) {
  const resumen = await peticionApi(`/tickets/disponibilidad/evento/${id}`);
  if (!Array.isArray(resumen?.sectores) || !Number.isFinite(resumen.disponibles))
    throw new Error("No se pudo consultar la disponibilidad del evento.");
  return resumen;
}

function aplicarDisponibilidad(evento, resumen) {
  const estados = { AGOTADO: "Agotado", DISPONIBLE: "Disponible", NO_DISPONIBLE: "Venta no habilitada", SIN_CONFIGURAR: "Sin sectores habilitados" };
  const estado = evento.yaPaso ? "Este evento ya pasó" : estados[resumen.estado] || "Por confirmar";
  const ventaHabilitada = resumen.venta_habilitada && !evento.yaPaso;
  const precios = resumen.sectores.filter(s => s.capacidad > 0).map(s => s.precio);
  return { ...evento, estado, capacidadTotal: resumen.capacidad_total, disponibles: resumen.disponibles,
    ventaHabilitada, precio: precios.length ? Math.min(...precios) : null,
    fechas: evento.fechas.map(fecha => ({ ...fecha, estado })),
    sectores: resumen.sectores.map(s => ({ ...s, planoId: s.plano_id,
      bloqueado: !ventaHabilitada || s.capacidad === 0,
      estado: s.disponibles === 0 ? "agotada" : "disponible" })),
  };
}

export async function cargarEventoDisponible(id) {
  const eventoId = id === "destacado" ? 1 : id;
  const [datos, resumen] = await Promise.all([
    peticionApi(`/eventos/${eventoId}`), cargarDisponibilidad(eventoId),
  ]);
  const evento = aplicarDisponibilidad(adaptarEvento(datos), resumen);
  try {
    const anteriores = JSON.parse(sessionStorage.getItem("catalogoBackend") || "[]");
    sessionStorage.setItem("catalogoBackend", JSON.stringify([
      ...anteriores.filter(e => String(e.id) !== String(evento.id)), evento,
    ]));
  } catch { /* No impide consultar disponibilidad si el almacenamiento está lleno. */ }
  return evento;
}

export function leerEventoCatalogo(id) {
  try {
    return JSON.parse(sessionStorage.getItem("catalogoBackend") || "[]")
      .find(evento => String(evento.id) === String(id));
  } catch { return undefined; }
}
