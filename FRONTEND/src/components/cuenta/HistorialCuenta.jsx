import { useEffect, useState } from "react";
import { cargarHistorial } from "../../services/historial";
import "./HistorialCuenta.css";

const estados = {
  CONFIRMADA: "Confirmada",
  PENDIENTE: "Pendiente",
  CANCELADA: "Cancelada",
  REEMBOLSADA: "Reembolsada",
};
const medios = { DEBITO: "Débito", CREDITO: "Crédito", TRANSFERENCIA: "Transferencia" };

function dinero(valor) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(valor);
}

function fechaCompra(valor) {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "Fecha por confirmar";
  return fecha.toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" });
}

export default function HistorialCuenta({ usuario }) {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarCompras() {
      try {
        const datos = await cargarHistorial(usuario.rut, controlador.signal);
        if (!controlador.signal.aborted) setCompras(datos);
      } catch (fallo) {
        if (!controlador.signal.aborted) setError(fallo.message);
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }

    cargarCompras();
    return () => controlador.abort();
  }, [usuario.rut, intento]);

  function reintentar() {
    setError("");
    setCargando(true);
    setIntento(anterior => anterior + 1);
  }

  const datosListos = !cargando && !error;

  return (
    <section className="cuenta_contenido historial_cuenta" aria-labelledby="historial_titulo">
      <h3 className="cuenta_titulo" id="historial_titulo">Historial de compras</h3>
      <p className="historial_intro">Revisa tus compras y los eventos a los que corresponden.</p>
      {cargando && (
        <div>
          <span role="status">Cargando historial…</span>
          <div className="historial_carga" aria-hidden="true">
            {[0, 1, 2].map(indice => <div key={indice} />)}
          </div>
        </div>
      )}
      {!cargando && error && (
        <div>
          <p role="alert">{error}</p>
          <button className="historial_enlace" onClick={reintentar}>Reintentar</button>
        </div>
      )}
      {datosListos && compras.length === 0 && (
        <div className="historial_compra">
          <p>Aún no tienes compras registradas.</p>
          <a className="historial_enlace" href="#/">Explorar eventos</a>
        </div>
      )}
      {datosListos && compras.length > 0 && (
        <div className="historial_lista">
          {compras.map(compra => (
            <article className="historial_compra" key={compra.id_venta}>
              <header className="historial_cabecera">
                <div>
                  <h4>Orden TKI-{compra.id_venta}</h4>
                  <p>Comprada el {fechaCompra(compra.fecha_venta)}</p>
                </div>
                <span className="historial_estado">
                  {estados[compra.estado_venta?.nombre] || compra.estado_venta?.nombre || "Por confirmar"}
                </span>
              </header>
              {compra.detalles.map(detalle => (
                <div className="historial_detalle" key={detalle.id_detalle}>
                  <div>
                    <a className="historial_evento" href={`#/evento/${detalle.evento_id_evento}`}>{detalle.nombre}</a>
                    <p>{detalle.fecha} · {detalle.sector}</p>
                  </div>
                  <span>{detalle.cantidad_ticket} {detalle.cantidad_ticket === 1 ? "entrada" : "entradas"}</span>
                </div>
              ))}
              <footer className="historial_total">
                <span>{medios[compra.medio_pago] || compra.medio_pago}</span>
                <strong>Total {dinero(compra.monto_total)}</strong>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
