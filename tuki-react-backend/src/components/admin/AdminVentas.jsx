import { useState } from "react";
import { useAdminDatos } from "../../hooks/useAdminDatos";
import { pesos } from "../../services/admin";

export function EstadoAdmin({ consulta }) {
  if (consulta.cargando) return <p role="status">Cargando datos…</p>;
  if (consulta.error) {
    return (
      <div>
        <p role="alert">{consulta.error}</p>
        <button className="admin_boton" onClick={consulta.recargar}>Reintentar</button>
      </div>
    );
  }
  return null;
}

export function DashboardReal() {
  const consulta = useAdminDatos("/ventas");
  const reembolsos = useAdminDatos("/ventas/reembolsos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const rangoInvalido = desde && hasta && desde > hasta;
  const cargando = consulta.cargando || reembolsos.cargando;
  const datosListos = consulta.datos && reembolsos.datos && !rangoInvalido;

  const ventas = (consulta.datos || []).filter(venta => {
    if (rangoInvalido) return false;
    const fecha = venta.fecha_venta.slice(0, 10);
    if (desde && fecha < desde) return false;
    if (hasta && fecha > hasta) return false;
    return true;
  });
  const confirmadas = ventas.filter(venta => venta.estado_venta?.nombre === "CONFIRMADA");
  const detalles = confirmadas.flatMap(venta => venta.detalles);
  const idsVentas = new Set(ventas.map(venta => venta.id_venta));
  const idsConfirmadas = new Set(confirmadas.map(venta => venta.id_venta));
  const devoluciones = (reembolsos.datos || []).filter(reembolso => idsVentas.has(reembolso.venta_id));

  // las compras reembolsadas completas ya no estan en las confirmadas
  const parciales = devoluciones.filter(reembolso => idsConfirmadas.has(reembolso.venta_id));
  function sumarDetalles(campo) {
    return detalles.reduce((total, detalle) => total + detalle[campo] * detalle.cantidad_ticket, 0);
  }
  function sumarDevolucionesParciales(campo) {
    return parciales.reduce((total, reembolso) => total + reembolso[campo], 0);
  }

  const montoConfirmado = confirmadas.reduce((total, venta) => total + venta.monto_total, 0);
  const montoDevueltoParcial = sumarDevolucionesParciales("monto");
  const montoDevueltoCompleto = ventas
    .filter(venta => venta.estado_venta?.nombre === "REEMBOLSADA")
    .reduce((total, venta) => total + venta.monto_total, 0);
  const entradasVendidas = detalles.reduce((total, detalle) => total + detalle.cantidad_ticket, 0);
  const indicadores = [
    ["Compras confirmadas", confirmadas.length, "Órdenes confirmadas en el período"],
    ["Total recaudado", pesos(montoConfirmado - montoDevueltoParcial), "Incluye IVA y cargos; descuenta devoluciones"],
    ["Ingresos por servicio", pesos(sumarDetalles("comision") - sumarDevolucionesParciales("comision")), "Comisiones netas de devoluciones; no es ganancia neta"],
    ["Entradas vendidas", entradasVendidas - parciales.length, "Entradas de compras confirmadas, descontando devoluciones"],
    ["IVA recaudado", pesos(sumarDetalles("precio_iva") - sumarDevolucionesParciales("iva")), "Impuesto neto de devoluciones"],
    ["Reembolsos", pesos(montoDevueltoCompleto + montoDevueltoParcial), "Reembolsos simulados completos y por entrada, sin duplicarlos"],
  ];

  function actualizarDashboard() {
    consulta.recargar();
    reembolsos.recargar();
  }

  return (
    <section>
      <h1>Dashboard</h1>
      <div className="admin_fila admin_periodo">
        <label className="admin_campo">
          Desde
          <input type="date" value={desde} onChange={event => setDesde(event.target.value)} />
        </label>
        <label className="admin_campo">
          Hasta
          <input type="date" value={hasta} onChange={event => setHasta(event.target.value)} />
        </label>
      </div>
      {rangoInvalido && <p role="alert">La fecha inicial debe ser anterior o igual a la final.</p>}
      <EstadoAdmin consulta={consulta} />
      <EstadoAdmin consulta={reembolsos} />
      {datosListos && (
        <>
          <div className="admin_indicadores">
            {indicadores.map(([titulo, valor, nota]) => (
              <article className="admin_tarjeta" key={titulo}>
                <h2>{titulo}</h2>
                <strong>{valor}</strong>
                <p>{nota}</p>
              </article>
            ))}
          </div>
          <p>El filtro usa la fecha de compra. Las compras pendientes, canceladas, anuladas y reembolsadas no suman ingresos.</p>
        </>
      )}
      <button className="admin_boton admin_boton_principal" onClick={actualizarDashboard} disabled={cargando}>
        {cargando ? "Actualizando…" : "Actualizar dashboard"}
      </button>
      {datosListos && (
        <>
          <h2>Devoluciones de entradas</h2>
          <div className="admin_tabla_contenedor">
            <table className="admin_tabla">
              <thead>
                <tr><th>Entrada</th><th>Orden</th><th>Fecha de devolución</th><th>Reembolso simulado</th></tr>
              </thead>
              <tbody>
                {devoluciones.map(reembolso => (
                  <tr key={reembolso.ticket_id}>
                    <td>#{reembolso.ticket_id}</td>
                    <td>TKI-{reembolso.venta_id}</td>
                    <td>{new Date(reembolso.creado_en).toLocaleString("es-CL")}</td>
                    <td>{pesos(reembolso.monto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {devoluciones.length === 0 && <p>No hay devoluciones de entradas en estas compras.</p>}
          </div>
        </>
      )}
    </section>
  );
}

export function HistorialAdminReal() {
  const consulta = useAdminDatos("/ventas");
  const ventasOrdenadas = [...(consulta.datos || [])].sort((primera, segunda) =>
    segunda.fecha_venta.localeCompare(primera.fecha_venta),
  );

  return (
    <section>
      <h1>Historial de compras</h1>
      <EstadoAdmin consulta={consulta} />
      {consulta.datos && (
        <div className="admin_tabla_contenedor">
          <table className="admin_tabla">
            <thead>
              <tr>
                {["Orden", "Fecha", "Estado", "Entradas", "Total"].map(titulo => (
                  <th key={titulo} scope="col">{titulo}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ventasOrdenadas.map(venta => (
                <tr key={venta.id_venta}>
                  <td>TKI-{venta.id_venta}</td>
                  <td>{new Date(venta.fecha_venta).toLocaleString("es-CL")}</td>
                  <td>{venta.estado_venta?.nombre}</td>
                  <td>{venta.detalles.reduce((total, detalle) => total + detalle.cantidad_ticket, 0)}</td>
                  <td>{pesos(venta.monto_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {ventasOrdenadas.length === 0 && <p>No hay compras registradas.</p>}
        </div>
      )}
    </section>
  );
}
