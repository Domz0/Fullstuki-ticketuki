import { peticionApi } from "./api";
import { cargarDetalleEvento } from "./eventos";
import { leerSesion } from "../utils/sesion";

export async function cargarHistorial(rut, signal) {
  const { token } = leerSesion();
  const ventas = await peticionApi(`/ventas/mis-compras?rut=${encodeURIComponent(rut)}`, { token, signal });
  if (!Array.isArray(ventas)) {
    throw new Error("No se pudo interpretar el historial de compras.");
  }

  // reunimos eventos sin repetir consulta de detalles
  const idsEventos = new Set();
  for (const venta of ventas) {
    for (const detalle of venta.detalles) {
      if (detalle.evento_id_evento) idsEventos.add(detalle.evento_id_evento);
    }
  }

  const catalogo = new Map();
  await Promise.all([...idsEventos].map(async id => {
    const detalleEvento = await cargarDetalleEvento(id, signal);
    catalogo.set(id, detalleEvento);
  }));

  signal?.throwIfAborted();
  if (leerSesion().token !== token) {
    throw new Error("La sesión cambió. Vuelve a cargar el historial.");
  }

  return ventas.map(venta => ({
    ...venta,
    detalles: venta.detalles.map(detalle => completarDetalle(detalle, catalogo)),
  }));
}

function completarDetalle(detalle, catalogo) {
  const datosEvento = catalogo.get(detalle.evento_id_evento);
  const evento = datosEvento?.evento;
  const sector = datosEvento?.sectores.find(item => item.id_sector === detalle.sector_id_sector);

  return {
    ...detalle,
    nombre: evento?.nombre_evento || `Evento ${detalle.evento_id_evento}`,
    fecha: evento?.fecha_visible || evento?.fecha_evento || "Fecha por confirmar",
    sector: sector?.nombre_sector || `Sector ${detalle.sector_id_sector}`,
  };
}
