import { useState } from "react";
import { useAdminDatos } from "../../hooks/useAdminDatos";
import { EstadoAdmin } from "./AdminVentas";
import { pesos } from "../../services/admin";

const estadosEntrada = { 1: "Válida", 2: "Utilizada", 3: "Cancelada", 4: "Transferida" };

function PaginaInvitados({ pagina, cambiarPagina }) {
  const consulta = useAdminDatos(`/compras/invitados-debug?pagina=${pagina}`);
  const eventos = useAdminDatos("/eventos");
  const compras = consulta.datos?.compras || [];
  const totalCompras = consulta.datos?.total || 0;
  const hayPaginaSiguiente = (pagina + 1) * 20 < totalCompras;

  function nombreEvento(id) {
    const evento = eventos.datos?.find(item => item.id_evento === id);
    return evento?.nombre_evento || `Evento #${id}`;
  }

  return (
    <>
      <button className="admin_boton" disabled={consulta.cargando} onClick={consulta.recargar}>
        Actualizar entradas
      </button>
      <EstadoAdmin consulta={consulta} />
      {consulta.datos && (
        <>
          {compras.length === 0 && <p>No hay compras de invitados en esta página.</p>}
          <div className="invitados_debug_lista">
            {compras.map(compra => (
              <article className="admin_tarjeta" key={compra.id}>
                <h2>Orden TKI-{compra.venta_id} · {compra.estado}</h2>
                <p>{compra.nombre_comprador} · {compra.rut_comprador} · {compra.correo_comprador}</p>
                <p>{new Date(compra.fecha_venta).toLocaleString("es-CL")} · Total {pesos(compra.monto_total)}</p>
                {compra.tickets.length === 0 ? (
                  <p>Esta orden todavía no tiene entradas emitidas.</p>
                ) : (
                  <div className="admin_tabla_contenedor">
                    <table className="admin_tabla">
                      <thead>
                        <tr>
                          {["Entrada", "Evento", "Sector", "Titular actual", "Código", "Estado"].map(titulo => (
                            <th scope="col" key={titulo}>{titulo}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {compra.tickets.map(entrada => (
                          <tr key={entrada.id_ticket}>
                            <td>#{entrada.id_ticket}</td>
                            <td>{nombreEvento(entrada.evento_id_evento)}</td>
                            <td>#{entrada.sector_id_sector}</td>
                            <td>{entrada.nombre_titular}<br />{entrada.run_titular}</td>
                            <td><code>{entrada.cod_qr}</code></td>
                            <td>{estadosEntrada[entrada.estado_ticket_id_estado] || "Por confirmar"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            ))}
          </div>
          <div className="admin_acciones">
            <button disabled={pagina === 0} onClick={() => cambiarPagina(pagina - 1)}>Anterior</button>
            <span>Página {pagina + 1} · {totalCompras} compras</span>
            <button disabled={!hayPaginaSiguiente} onClick={() => cambiarPagina(pagina + 1)}>Siguiente</button>
          </div>
        </>
      )}
    </>
  );
}

export default function EntradasInvitadoDebug() {
  const [pagina, setPagina] = useState(0);
  return (
    <section>
      <h1>Entradas invitado (debug)</h1>
      <p>Compras realizadas sin iniciar sesión y sus entradas guardadas en el backend. Esta vista es solo para administración; no envía correos.</p>
      <p>Solo se incluyen compras identificadas como invitado al momento de crearlas.</p>
      <PaginaInvitados key={pagina} pagina={pagina} cambiarPagina={setPagina} />
    </section>
  );
}
