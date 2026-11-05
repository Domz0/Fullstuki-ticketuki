import PasosCompra from "../components/PasosCompra";
import FormularioPago from "../components/FormularioPago";
import ResumenPago from "../components/ResumenPago";
import { navegar } from "../utils/navegacion";

function PaginaPago({ evento, fecha, seleccion, cantidad }) {
  function continuarAConfirmacion(metodo) {
    const consulta = `?cantidad=${cantidad}&fecha=${encodeURIComponent(fecha.id)}`;
    navegar(
      `/confirmacion/${evento.id}${consulta}&metodo=${encodeURIComponent(metodo)}`,
    );
  }

  return (
    <>
      <PasosCompra etapa="pago" />
      <div className="pago_contenedor">
        <FormularioPago onValidado={continuarAConfirmacion} />
        <ResumenPago
          evento={evento}
          fecha={fecha}
          seleccion={seleccion}
          cantidad={cantidad}
        />
      </div>
    </>
  );
}

export default PaginaPago;
