import { useState } from "react";
import ElegirEntradas from "../components/compras/ElegirEntradas";
import { useEventoDisponible } from "../hooks/useEventoDisponible";
import { cargarEventoDisponible } from "../services/eventos";
import { guardarCompra, crearSeleccion, leerCompra } from "../utils/compra";
import { navegar } from "../utils/navegacion";

// se elige que sector comprar
function PaginaEntradas({ eventoId }) {
  const { evento, error, cargando, reintentar } = useEventoDisponible(eventoId);
  const [sectorId, setSectorId] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [verificando, setVerificando] = useState(false);

  const compraPendiente = leerCompra();

  if (compraPendiente?.estado === "procesando") {
    const enlace = "#/pago/" + compraPendiente.eventoId
      + "?fecha=" + encodeURIComponent(compraPendiente.fechaId);

    return (
      <section>
        <h2>Tienes una compra pendiente en esta pestaña</h2>
        <p>Consulta su estado antes de iniciar otra compra. Para otra selección puedes usar una pestaña nueva.</p>
        <a className="pago_volver" href={enlace}>Recuperar compra pendiente</a>
      </section>
    );
  }

  if (cargando) {
    return <p role="status">Consultando cupos…</p>;
  }

  if (error) {
    return (
      <section>
        <p role="alert">{error}</p>
        <button onClick={reintentar}>Reintentar</button>
      </section>
    );
  }

  const sectores = evento.sectores;
  const fecha = evento.fechas[0];
  const sector = sectores.find(sectorDisponible => sectorDisponible.id === sectorId);
  let seleccion = null;

  if (sector && !sector.bloqueado && sector.estado !== "agotada") {
    const cantidadDisponible = Math.min(cantidad, sector.disponibles);
    seleccion = {
      ...crearSeleccion(evento, fecha, sector, cantidadDisponible),
      disponibles: sector.disponibles,
      capacidad: sector.capacidad,
    };
  }

  function elegirSector(id) {
    setSectorId(id);
    setCantidad(1);
    setMensaje("");
  }

  function cambiarCantidad(valor) {
    const disponibles = sector?.disponibles || 1;
    const cantidadPermitida = Math.max(1, Math.min(6, disponibles, valor));
    setCantidad(cantidadPermitida);
  }

  async function continuarAlPago() {
    if (!seleccion || verificando) return;

    setVerificando(true);
    setMensaje("Comprobando disponibilidad…");

    try {
      const eventoActualizado = await cargarEventoDisponible(evento.id);
      const sectorActualizado = eventoActualizado.sectores.find(sector => sector.id === sectorId);
      const hayCupos = sectorActualizado && sectorActualizado.disponibles >= seleccion.cantidad;

      if (!eventoActualizado.ventaHabilitada || !hayCupos) {
        setMensaje("Los cupos cambiaron. Revisa la disponibilidad y elige nuevamente.");
        reintentar();
        return;
      }

      const nuevaSeleccion = crearSeleccion(
        eventoActualizado,
        eventoActualizado.fechas[0],
        sectorActualizado,
        seleccion.cantidad,
      );

      guardarCompra(nuevaSeleccion);
      navegar("/pago/" + evento.id + "?fecha=principal");
    } catch (fallo) {
      setMensaje(fallo.message || "No se pudo consultar la disponibilidad.");
    } finally {
      setVerificando(false);
    }
  }

  return (
    <>
      <ElegirEntradas
        evento={evento}
        fechaElegida={fecha}
        sectores={sectores}
        seleccion={seleccion}
        onElegir={elegirSector}
        onCambiarCantidad={cambiarCantidad}
        onContinuar={continuarAlPago}
      />
      {sector && !seleccion && (
        <p role="status">El sector seleccionado ya no está disponible. Elige otro sector.</p>
      )}
      {mensaje && <p role="status">{mensaje}</p>}
    </>
  );
}

export default PaginaEntradas;
