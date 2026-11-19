import { peticionApi } from "./api";
import { leerSesion } from "../utils/sesion";

export async function cargarHistorial(rut, signal) {
  const { token } = leerSesion();
  const ventas = await peticionApi(`/ventas/mis-compras?rut=${encodeURIComponent(rut)}`, { token, signal });
  if (!Array.isArray(ventas)) throw new Error("No se pudo interpretar el historial de compras.");
  const ids = [...new Set(ventas.flatMap(v => v.detalles.map(d => d.evento_id_evento)).filter(Boolean))];
  const catalogo = new Map(await Promise.all(ids.map(async id => {
    const [evento, sectores] = await Promise.allSettled([
      peticionApi(`/eventos/${id}`, { signal }),
      peticionApi(`/eventos/${id}/sectores`, { signal }),
    ]);
    return [id, { evento: evento.status === "fulfilled" ? evento.value : null,
      sectores: sectores.status === "fulfilled" && Array.isArray(sectores.value) ? sectores.value : [] }];
  })));
  signal?.throwIfAborted();
  if (leerSesion().token !== token) throw new Error("La sesión cambió. Vuelve a cargar el historial.");
  return ventas.map(venta => ({ ...venta, detalles: venta.detalles.map(detalle => {
    const { evento, sectores } = catalogo.get(detalle.evento_id_evento) || {};
    const sector = sectores?.find(s => s.id_sector === detalle.sector_id_sector);
    return { ...detalle, nombre: evento?.nombre_evento || `Evento ${detalle.evento_id_evento}`,
      fecha: evento?.fecha_visible || evento?.fecha_evento || "Fecha por confirmar",
      sector: sector?.nombre_sector || `Sector ${detalle.sector_id_sector}` };
  }) }));
}
