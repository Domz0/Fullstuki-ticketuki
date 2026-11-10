import { useRef, useState } from "react";
import "./PaginaPago.css";
import PasosCompra from "../components/PasosCompra";
import FormularioPago from "../components/FormularioPago";
import ResumenPago from "../components/ResumenPago";
import { leerCompra, guardarCompra, confirmarCompra, rechazarCompra } from "../utils/compra";
import { tarjetaVencida } from "../utils/validarPago";
import { guardarEntrada } from "../utils/entradas";
import { navegar } from "../utils/navegacion";

function PaginaPago({ evento, fecha, usuario }) {
  const [compra, setCompra] = useState(leerCompra);
  const [mensaje, setMensaje] = useState("");
  const confirmando = useRef(false);
  if (!compra || compra.eventoId !== evento.id || compra.fechaId !== fecha.id) {
    return <section><h2>Elige tus entradas primero</h2><a className="pago_volver" href={`#/entradas/${evento.id}?fecha=${encodeURIComponent(fecha.id)}`}>Elegir entradas</a></section>;
  }

  function aplicarCodigo(codigo) {
    const nueva = { ...compra, codigoDescuento: codigo };
    guardarCompra(nueva);
    setCompra(nueva);
  }

  function continuarAConfirmacion(datos, metodo, cuotas) {
    if (confirmando.current) return;
    confirmando.current = true;
    try {
      if (compra.estado !== "confirmada" && metodo === "credito" && tarjetaVencida(datos.vencimiento)) {
        guardarCompra(rechazarCompra(compra, datos, metodo, "Tarjeta vencida"));
        navegar(`/pago-fallido/${evento.id}?fecha=${encodeURIComponent(fecha.id)}`);
        return;
      }
      const confirmada = compra.estado === "confirmada"
        ? compra : confirmarCompra(compra, datos, metodo, cuotas);
      guardarCompra(confirmada);
      setCompra(confirmada);
      guardarEntrada(confirmada, usuario);
      navegar(`/confirmacion/${evento.id}?fecha=${encodeURIComponent(fecha.id)}`);
    } catch {
      confirmando.current = false;
      setMensaje("No se pudo confirmar la compra. Inténtalo nuevamente.");
    }
  }

  return (
    <>
      <PasosCompra etapa="pago" />
      <a className="pago_volver" href={`#/entradas/${evento.id}?fecha=${encodeURIComponent(fecha.id)}`}>Volver a elegir entradas</a>
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
