import { useState } from "react";
import PasosCompra from "../components/PasosCompra";
import FormularioPago from "../components/FormularioPago";
import ResumenPago from "../components/ResumenPago";
import { leerCompra, guardarCompra, confirmarCompra } from "../utils/compra";
import { navegar } from "../utils/navegacion";

function PaginaPago({ evento, fecha, usuario }) {
  const [compra, setCompra] = useState(leerCompra);
  const [mensaje, setMensaje] = useState("");
  if (!compra || compra.eventoId !== evento.id || compra.fechaId !== fecha.id) {
    return <section><h2>Elige tus entradas primero</h2><a href={`#/entradas/${evento.id}?fecha=${encodeURIComponent(fecha.id)}`}>Elegir entradas</a></section>;
  }

  function aplicarCodigo(codigo) {
    const nueva = { ...compra, codigoDescuento: codigo };
    guardarCompra(nueva);
    setCompra(nueva);
  }

  function continuarAConfirmacion(datos, metodo, cuotas) {
    try {
      guardarCompra(confirmarCompra(compra, datos, metodo, cuotas));
      navegar(`/confirmacion/${evento.id}?fecha=${encodeURIComponent(fecha.id)}`);
    } catch {
      setMensaje("No se pudo confirmar la compra. Inténtalo nuevamente.");
    }
  }

  return (
    <>
      <PasosCompra etapa="pago" />
      <a href={`#/entradas/${evento.id}?fecha=${encodeURIComponent(fecha.id)}`}>Volver a elegir entradas</a>
      <div className="pago_contenedor">
        <FormularioPago usuario={usuario} comprador={compra.comprador}
          codigoAplicado={compra.codigoDescuento} onAplicarCodigo={aplicarCodigo}
          onValidado={continuarAConfirmacion} />
        <ResumenPago evento={evento} fecha={fecha} seleccion={compra}
          cantidad={compra.cantidad} codigo={compra.codigoDescuento} />
      </div>
      <p className="txt_error" role="status">{mensaje}</p>
    </>
  );
}
export default PaginaPago;
