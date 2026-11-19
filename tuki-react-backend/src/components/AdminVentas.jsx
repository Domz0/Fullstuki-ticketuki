import { useState } from "react";
import { useAdminDatos } from "../hooks/useAdminDatos";
import { pesos } from "../services/admin";

export function EstadoAdmin({ consulta }) {
  if (consulta.cargando) return <p role="status">Cargando datos…</p>;
  if (consulta.error) return <div><p role="alert">{consulta.error}</p><button className="admin_boton" onClick={consulta.recargar}>Reintentar</button></div>;
  return null;
}

export function DashboardReal() {
  const consulta = useAdminDatos("/ventas");
  const reembolsos = useAdminDatos("/ventas/reembolsos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const rangoInvalido = desde && hasta && desde > hasta;
  const ventas = (consulta.datos || []).filter(v => !rangoInvalido && (!desde || v.fecha_venta.slice(0, 10) >= desde) && (!hasta || v.fecha_venta.slice(0, 10) <= hasta));
  const confirmadas = ventas.filter(v => v.estado_venta?.nombre === "CONFIRMADA");
  const detalles = confirmadas.flatMap(v => v.detalles);
  const sumar = campo => detalles.reduce((s, d) => s + d[campo] * d.cantidad_ticket, 0);
  const ids = new Set(ventas.map(v => v.id_venta));
  const idsConfirmadas = new Set(confirmadas.map(v => v.id_venta));
  const devoluciones = (reembolsos.datos || []).filter(r => ids.has(r.venta_id));
  const parciales = devoluciones.filter(r => idsConfirmadas.has(r.venta_id));
  const restar = campo => parciales.reduce((s, r) => s + r[campo], 0);
  const totalReembolsos = ventas.filter(v => v.estado_venta?.nombre === "REEMBOLSADA").reduce((s, v) => s + v.monto_total, 0) + restar("monto");
  return <section><h1>Dashboard</h1>
    <div className="admin_fila admin_periodo">
      <label className="admin_campo">Desde<input type="date" value={desde} onChange={e => setDesde(e.target.value)} /></label>
      <label className="admin_campo">Hasta<input type="date" value={hasta} onChange={e => setHasta(e.target.value)} /></label>
    </div>
    {rangoInvalido && <p role="alert">La fecha inicial debe ser anterior o igual a la final.</p>}
    <EstadoAdmin consulta={consulta} />
    <EstadoAdmin consulta={reembolsos} />
    {consulta.datos && reembolsos.datos && !rangoInvalido && <>
      <div className="admin_indicadores">
        {[
          ["Compras confirmadas", confirmadas.length, "Órdenes confirmadas en el período"],
          ["Total recaudado", pesos(confirmadas.reduce((s, v) => s + v.monto_total, 0) - restar("monto")), "Incluye IVA y cargos; descuenta devoluciones"],
          ["Ingresos por servicio", pesos(sumar("comision") - restar("comision")), "Comisiones netas de devoluciones; no es ganancia neta"],
          ["Entradas vendidas", detalles.reduce((s, d) => s + d.cantidad_ticket, 0) - parciales.length, "Entradas de compras confirmadas, descontando devoluciones"],
          ["IVA recaudado", pesos(sumar("precio_iva") - restar("iva")), "Impuesto neto de devoluciones"],
          ["Reembolsos", pesos(totalReembolsos), "Reembolsos simulados completos y por entrada, sin duplicarlos"],
        ].map(([titulo, valor, nota]) => <article className="admin_tarjeta" key={titulo}><h2>{titulo}</h2><strong>{valor}</strong><p>{nota}</p></article>)}
      </div>
      <p>El filtro usa la fecha de compra. Las compras pendientes, canceladas, anuladas y reembolsadas no suman ingresos.</p>
    </>}
    <button className="admin_boton admin_boton_principal" onClick={() => { consulta.recargar(); reembolsos.recargar(); }} disabled={consulta.cargando || reembolsos.cargando}> {consulta.cargando || reembolsos.cargando ? "Actualizando…" : "Actualizar dashboard"}</button>
    {consulta.datos && reembolsos.datos && !rangoInvalido && <>
      <h2>Devoluciones de entradas</h2>
      <div className="admin_tabla_contenedor"><table className="admin_tabla">
        <thead><tr><th>Entrada</th><th>Orden</th><th>Fecha de devolución</th><th>Reembolso simulado</th></tr></thead>
        <tbody>{devoluciones.map(r => <tr key={r.ticket_id}><td>#{r.ticket_id}</td><td>TKI-{r.venta_id}</td><td>{new Date(r.creado_en).toLocaleString("es-CL")}</td><td>{pesos(r.monto)}</td></tr>)}</tbody>
      </table>{!devoluciones.length && <p>No hay devoluciones de entradas en estas compras.</p>}</div>
    </>}
  </section>;
}

export function HistorialAdminReal() {
  const consulta = useAdminDatos("/ventas");
  return <section><h1>Historial de compras</h1><EstadoAdmin consulta={consulta} />
    {consulta.datos && <div className="admin_tabla_contenedor"><table className="admin_tabla">
      <thead><tr>{["Orden", "Fecha", "Estado", "Entradas", "Total"].map(t => <th key={t} scope="col">{t}</th>)}</tr></thead>
      <tbody>{[...consulta.datos].sort((a, b) => b.fecha_venta.localeCompare(a.fecha_venta)).map(v => <tr key={v.id_venta}>
        <td>TKI-{v.id_venta}</td><td>{new Date(v.fecha_venta).toLocaleString("es-CL")}</td><td>{v.estado_venta?.nombre}</td>
        <td>{v.detalles.reduce((s, d) => s + d.cantidad_ticket, 0)}</td><td>{pesos(v.monto_total)}</td>
      </tr>)}</tbody></table>{consulta.datos.length === 0 && <p>No hay compras registradas.</p>}</div>}
  </section>;
}
