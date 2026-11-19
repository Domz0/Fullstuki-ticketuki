import { useEffect, useState } from "react";
import { peticionApi } from "../services/api";
import { adaptarEvento } from "../services/eventos";
import PaginaPago from "./PaginaPago";
import PaginaPagoFallido from "./PaginaPagoFallido";
import PaginaConfirmacion from "./PaginaConfirmacion";

export default function PaginaFlujoCompra({ eventoId, fechaId, pantalla, usuario }) {
  const [consulta, setConsulta] = useState({ evento: null, cargando: true, error: "" });
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    const controlador = new AbortController();
    async function cargar() {
      try {
        if (!/^[1-9]\d*$/.test(String(eventoId))) throw new Error("El identificador del evento no es válido.");
        const datos = await peticionApi(`/eventos/${eventoId}`, { signal: controlador.signal });
        if (!datos || String(datos.id_evento) !== String(eventoId)) throw new Error("No se pudo interpretar el evento del servidor.");
        if (!controlador.signal.aborted) setConsulta({ evento: adaptarEvento(datos), cargando: false, error: "" });
      } catch (error) {
        if (!controlador.signal.aborted) setConsulta({ evento: null, cargando: false, error: error.message });
      }
    }
    cargar();
    return () => controlador.abort();
  }, [eventoId, intento]);

  if (consulta.cargando) return <section className="pago_cargando" role="status">
    <span className="pago_cargando_circulo" aria-hidden="true" /><h2>Cargando evento</h2><p>Consultando los datos de tu compra…</p>
  </section>;
  if (consulta.error) return <section><h2>No se pudo cargar el evento</h2><p role="alert">{consulta.error}</p>
    <button className="pago_volver" onClick={() => { setConsulta({ evento: null, cargando: true, error: "" }); setIntento(i => i + 1); }}>Reintentar</button>
    <a className="pago_volver" href="#/inicio">Volver al inicio</a></section>;
  const evento = consulta.evento;
  const fecha = evento.fechas.find(f => f.id === (fechaId || "principal"));
  if (!fecha) return <section><h2>La función seleccionada no existe</h2><a className="pago_volver" href={`#/entradas/${evento.id}`}>Elegir entradas</a></section>;
  if (pantalla === "pago") return <PaginaPago evento={evento} fecha={fecha} usuario={usuario} />;
  if (pantalla === "pago-fallido") return <PaginaPagoFallido evento={evento} fecha={fecha} />;
  return <PaginaConfirmacion evento={evento} fecha={fecha} />;
}
