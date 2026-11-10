import PasosCompra from "../components/PasosCompra";
import PagoFallido from "../components/PagoFallido";
import { leerCompra } from "../utils/compra";
import { navegar } from "../utils/navegacion";

const metodos = { debito: "Débito", credito: "Crédito", transferencia: "Transferencia bancaria" };

function PaginaPagoFallido({ evento, fecha }) {
  const compra = leerCompra();
  const consulta = `?fecha=${encodeURIComponent(fecha.id)}`;
  if (!compra || compra.estado !== "rechazada" || compra.eventoId !== evento.id || compra.fechaId !== fecha.id) {
    return <section><h2>No hay un pago rechazado para esta función</h2><a href={`#/entradas/${evento.id}${consulta}`}>Elegir entradas</a></section>;
  }
  return (
    <>
      <PasosCompra etapa="pago" />
      <PagoFallido
        compra={{ ...compra, metodoPago: metodos[compra.metodo] }}
        onReintentar={() => navegar(`/pago/${evento.id}${consulta}`)}
      />
    </>
  );
}
export default PaginaPagoFallido;
