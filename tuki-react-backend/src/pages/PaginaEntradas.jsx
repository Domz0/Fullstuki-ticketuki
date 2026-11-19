import { useState } from "react";
import ElegirEntradas from "../components/ElegirEntradas";
import { useEventoDisponible } from "../hooks/useEventoDisponible";
import { cargarEventoDisponible } from "../services/eventos";
import { guardarCompra, crearSeleccion, leerCompra } from "../utils/compra";
import { navegar } from "../utils/navegacion";

function PaginaEntradas({ eventoId }) {
  const { evento, error, cargando, reintentar } = useEventoDisponible(eventoId);
  const [sectorId, setSectorId] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [verificando, setVerificando] = useState(false);
  const pendiente = leerCompra();
  if (pendiente?.estado === "procesando") return <section><h2>Tienes una compra pendiente en esta pestaña</h2>
    <p>Consulta su estado antes de iniciar otra compra. Para otra selección puedes usar una pestaña nueva.</p>
    <a className="pago_volver" href={`#/pago/${pendiente.eventoId}?fecha=${encodeURIComponent(pendiente.fechaId)}`}>Recuperar compra pendiente</a></section>;
  if (cargando) return <p role="status">Consultando cupos…</p>;
  if (error) return <section><p role="alert">{error}</p><button onClick={reintentar}>Reintentar</button></section>;
  const sectores = evento.sectores;
  const fecha = evento.fechas[0];
  const sector = sectores.find(s => s.id === sectorId);
  const seleccion = sector && !sector.bloqueado && sector.estado !== "agotada" ? {
    ...crearSeleccion(evento, fecha, sector, Math.min(cantidad, sector.disponibles)),
    disponibles: sector.disponibles, capacidad: sector.capacidad,
  } : null;

  async function continuarAlPago() {
    if (!seleccion || verificando) return;
    setVerificando(true);
    setMensaje("Comprobando disponibilidad…");
    try {
      const actualizado = await cargarEventoDisponible(evento.id);
      const vigente = actualizado.sectores.find(s => s.id === sectorId);
      if (!actualizado.ventaHabilitada || !vigente || vigente.disponibles < seleccion.cantidad) {
        setMensaje("Los cupos cambiaron. Revisa la disponibilidad y elige nuevamente.");
        reintentar();
        return;
      }
      guardarCompra(crearSeleccion(actualizado, actualizado.fechas[0], vigente, seleccion.cantidad));
      navegar(`/pago/${evento.id}?fecha=principal`);
    } catch (error) {
      setMensaje(error.message || "No se pudo consultar la disponibilidad.");
    } finally { setVerificando(false); }
  }

  return <>
    <ElegirEntradas evento={evento} fechaElegida={fecha} sectores={sectores} seleccion={seleccion}
      onElegir={id => { setSectorId(id); setCantidad(1); setMensaje(""); }}
      onCambiarCantidad={valor => setCantidad(Math.max(1, Math.min(6, sector?.disponibles || 1, valor)))}
      onContinuar={continuarAlPago} />
    {sector && !seleccion && <p role="status">El sector seleccionado ya no está disponible. Elige otro sector.</p>}
    {mensaje && <p role="status">{mensaje}</p>}
  </>;
}
export default PaginaEntradas;
