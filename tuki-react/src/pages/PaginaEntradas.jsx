import ElegirEntradas from "../components/ElegirEntradas";
import { navegar } from "../utils/navegacion";

function PaginaEntradas({ evento, fecha, seleccion }) {
  function continuarAlPago(cantidad) {
    navegar(
      `/pago/${evento.id}?cantidad=${cantidad}&fecha=${encodeURIComponent(fecha.id)}`,
    );
  }

  return (
    <ElegirEntradas
      evento={evento}
      fechaElegida={fecha}
      seleccion={seleccion}
      onContinuar={continuarAlPago}
    />
  );
}

export default PaginaEntradas;
