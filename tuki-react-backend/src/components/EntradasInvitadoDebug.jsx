import { useState } from "react";
import { useAdminDatos } from "../hooks/useAdminDatos";
import { EstadoAdmin } from "./AdminVentas";
import { pesos } from "../services/admin";

function PaginaInvitados({ pagina, cambiarPagina }) {
  const consulta = useAdminDatos(`/compras/invitados-debug?pagina=${pagina}`);
  const eventos = useAdminDatos("/eventos");
  const nombres = new Map((eventos.datos || []).map(e => [e.id_evento, e.nombre_evento]));
  const estados = { 1: "Válida", 2: "Utilizada", 3: "Cancelada", 4: "Transferida" };
  return <>
    <button className="admin_boton" disabled={consulta.cargando} onClick={consulta.recargar}>Actualizar entradas</button>
    <EstadoAdmin consulta={consulta} />
    {consulta.datos && <>
      {consulta.datos.compras.length === 0 && <p>No hay compras de invitados en esta página.</p>}
      <div className="invitados_debug_lista">{consulta.datos.compras.map(c => <article className="admin_tarjeta" key={c.id}>
        <h2>Orden TKI-{c.venta_id} · {c.estado}</h2>
        <p>{c.nombre_comprador} · {c.rut_comprador} · {c.correo_comprador}</p>
        <p>{new Date(c.fecha_venta).toLocaleString("es-CL")} · Total {pesos(c.monto_total)}</p>
        {c.tickets.length === 0 ? <p>Esta orden todavía no tiene entradas emitidas.</p> : <div className="admin_tabla_contenedor"><table className="admin_tabla">
          <thead><tr>{["Entrada", "Evento", "Sector", "Titular actual", "Código", "Estado"].map(t => <th scope="col" key={t}>{t}</th>)}</tr></thead>
          <tbody>{c.tickets.map(t => <tr key={t.id_ticket}><td>#{t.id_ticket}</td><td>{nombres.get(t.evento_id_evento) || `Evento #${t.evento_id_evento}`}</td>
            <td>#{t.sector_id_sector}</td><td>{t.nombre_titular}<br />{t.run_titular}</td><td><code>{t.cod_qr}</code></td><td>{estados[t.estado_ticket_id_estado] || "Por confirmar"}</td></tr>)}</tbody>
        </table></div>}
      </article>)}</div>
      <div className="admin_acciones"><button disabled={pagina === 0} onClick={() => cambiarPagina(pagina - 1)}>Anterior</button>
        <span>Página {pagina + 1} · {consulta.datos.total} compras</span>
        <button disabled={(pagina + 1) * 20 >= consulta.datos.total} onClick={() => cambiarPagina(pagina + 1)}>Siguiente</button></div>
    </>}
  </>;
}

export default function EntradasInvitadoDebug() {
  const [pagina, setPagina] = useState(0);
  return <section><h1>Entradas invitado (debug)</h1>
    <p>Compras realizadas sin iniciar sesión y sus entradas guardadas en el backend. Esta vista es solo para administración; no envía correos.</p>
    <p>Solo se incluyen compras identificadas como invitado al momento de crearlas.</p>
    <PaginaInvitados key={pagina} pagina={pagina} cambiarPagina={setPagina} />
  </section>;
}
