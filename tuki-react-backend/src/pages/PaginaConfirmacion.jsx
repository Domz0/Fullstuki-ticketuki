import PasosCompra from "../components/PasosCompra";
import Confirmacion from "../components/Confirmacion";
import { leerCompra } from "../utils/compra";
import qrEjemplo from "../assets/qr-ejemplo.png";

function PaginaConfirmacion({ evento, fecha }) {
  const compra = leerCompra();
  if (!compra || compra.estado !== "confirmada" || compra.eventoId !== evento.id || compra.fechaId !== fecha.id) {
    return <section><h2>No hay una compra confirmada para esta función</h2><a href={`#/entradas/${evento.id}?fecha=${encodeURIComponent(fecha.id)}`}>Elegir entradas</a></section>;
  }
  const metodos = { debito: "Débito", credito: "Crédito", transferencia: "Transferencia bancaria" };
  return (
    <>
      <PasosCompra etapa="confirmacion" />
      <Confirmacion compra={{ ...compra, metodoPago: metodos[compra.metodo], qr: qrEjemplo }} />
    </>
  );
}
export default PaginaConfirmacion;
