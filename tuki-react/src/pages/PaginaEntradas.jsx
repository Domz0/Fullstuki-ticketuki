import { useState } from "react";
import ElegirEntradas from "../components/ElegirEntradas";
import { obtenerSectores } from "../data/sectores";
import { guardarCompra, crearSeleccion } from "../utils/compra";
import { navegar } from "../utils/navegacion";

function PaginaEntradas({ evento, fecha }) {
  const sectores = obtenerSectores(evento);
  const [seleccion, setSeleccion] = useState(null);
  const [mensaje, setMensaje] = useState("");

  function seleccionar(sectorId, cantidad) {
    const sector = sectores.find((item) => item.id === sectorId);
    if (!sector || sector.estado === "agotada" || fecha.estado === "Agotado") return;
    const nueva = crearSeleccion(evento, fecha, sector, cantidad);
    setSeleccion(nueva);
    try {
      guardarCompra(nueva);
      setMensaje("");
    } catch {
      setMensaje("No se pudo guardar la selección. Inténtalo nuevamente.");
    }
  }

  function continuarAlPago() {
    if (!seleccion) return;
    try {
      guardarCompra({ ...seleccion, estado: "seleccion" });
      navegar(`/pago/${evento.id}?fecha=${encodeURIComponent(fecha.id)}`);
    } catch {
      setMensaje("No se pudo continuar. Inténtalo nuevamente.");
    }
  }

  return (
    <>
      <ElegirEntradas evento={evento} fechaElegida={fecha} sectores={sectores}
        seleccion={seleccion}
        onElegir={(sectorId) => seleccionar(sectorId, seleccion?.cantidad || 1)}
        onCambiarCantidad={(cantidad) => seleccionar(seleccion.sectorId, cantidad)}
        onContinuar={continuarAlPago} />
      <p className="txt_error" role="status">{mensaje}</p>
    </>
  );
}
export default PaginaEntradas;
