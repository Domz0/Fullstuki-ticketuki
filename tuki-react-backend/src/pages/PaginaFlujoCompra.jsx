import { useEffect, useState } from "react";
import { peticionApi } from "../services/api";
import { adaptarEvento } from "../services/eventos";
import PaginaPago from "./PaginaPago";
import PaginaPagoFallido from "./PaginaPagoFallido";
import PaginaConfirmacion from "./PaginaConfirmacion";

// evento que comparten las pantallas de pago, rechazo y confirmacion
function PaginaFlujoCompra({ eventoId, fechaId, pantalla, usuario }) {
  const [evento, setEvento] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarEvento() {
      const idValido = /^[1-9]\d*$/.test(String(eventoId));

      if (!idValido) {
        setError("El identificador del evento no es válido.");
        setCargando(false);
        return;
      }

      try {
        const datos = await peticionApi("/eventos/" + eventoId, {
          signal: controlador.signal,
        });

        if (controlador.signal.aborted) return;

        if (!datos || String(datos.id_evento) !== String(eventoId)) {
          setError("No se pudo interpretar el evento del servidor.");
          return;
        }

        setEvento(adaptarEvento(datos));
      } catch (fallo) {
        if (!controlador.signal.aborted) {
          setError(fallo.message || "No se pudo cargar el evento.");
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarEvento();

    // cancela la consulta al salir para no aplicar una respuesta a una pantalla anterior
    return () => controlador.abort();
  }, [eventoId, recarga]);

  function reintentarCarga() {
    setEvento(null);
    setError("");
    setCargando(true);
    setRecarga(recarga + 1);
  }

  if (cargando) {
    return (
      <section className="pago_cargando" role="status">
        <span className="pago_cargando_circulo" aria-hidden="true" />
        <h2>Cargando evento</h2>
        <p>Consultando los datos de tu compra…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2>No se pudo cargar el evento</h2>
        <p role="alert">{error}</p>
        <button className="pago_volver" onClick={reintentarCarga}>Reintentar</button>
        <a className="pago_volver" href="#/inicio">Volver al inicio</a>
      </section>
    );
  }

  const funcionElegida = fechaId || "principal";
  const fecha = evento.fechas.find(funcion => funcion.id === funcionElegida);

  if (!fecha) {
    return (
      <section>
        <h2>La función seleccionada no existe</h2>
        <a className="pago_volver" href={"#/entradas/" + evento.id}>Elegir entradas</a>
      </section>
    );
  }

  // manda segun resultado
  if (pantalla === "pago") {
    return <PaginaPago evento={evento} fecha={fecha} usuario={usuario} />;
  }

  if (pantalla === "pago-fallido") {
    return <PaginaPagoFallido evento={evento} fecha={fecha} />;
  }

  return <PaginaConfirmacion evento={evento} fecha={fecha} />;
}

export default PaginaFlujoCompra;
