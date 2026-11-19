import { useEffect, useRef, useState } from "react";
import "./PaginaPago.css";
import PasosCompra from "../components/PasosCompra";
import FormularioPago from "../components/FormularioPago";
import ResumenPago from "../components/ResumenPago";
import { leerCompra, guardarCompra, rechazarCompra } from "../utils/compra";
import { tarjetaVencida } from "../utils/validarPago";
import { prepararCompra, procesarCompra } from "../services/compras";
import { navegar } from "../utils/navegacion";

function PaginaPago({ evento, fecha, usuario }) {
  const [compra, setCompra] = useState(leerCompra);
  const [mensaje, setMensaje] = useState("");
  const confirmando = useRef(false);
  const consulta = useRef(null);
  useEffect(() => () => consulta.current?.abort(), []);
  const [procesando, setProcesando] = useState(false);
  if (!compra || String(compra.eventoId) !== String(evento.id) || compra.fechaId !== fecha.id) {
    return <section><h2>Elige tus entradas primero</h2><a className="pago_volver" href={`#/entradas/${evento.id}?fecha=${encodeURIComponent(fecha.id)}`}>Elegir entradas</a></section>;
  }

  async function continuarAConfirmacion(datos, metodo, cuotas) {
    if (confirmando.current) return;
    confirmando.current = true;
    const controlador = new AbortController();
    consulta.current = controlador;
    setProcesando(true);
    setMensaje("Registrando compra…");
    try {
      if (!compra.solicitudBackend && metodo === "credito" && tarjetaVencida(datos.vencimiento)) {
        guardarCompra(rechazarCompra(compra, datos, metodo, "Tarjeta vencida"));
        navegar(`/pago-fallido/${evento.id}?fecha=${encodeURIComponent(fecha.id)}`);
        return;
      }
      const pendiente = compra.solicitudBackend ? compra : await prepararCompra(compra, datos, metodo, cuotas);
      controlador.signal.throwIfAborted();
      guardarCompra(pendiente);
      setCompra(pendiente);
      const confirmada = await procesarCompra(pendiente, (actualizada, aviso) => {
        guardarCompra(actualizada);
        setCompra(actualizada);
        setMensaje(aviso);
      }, controlador.signal);
      guardarCompra(confirmada);
      setCompra(confirmada);
      navegar(`/${confirmada.estado === "confirmada" ? "confirmacion" : "pago-fallido"}/${evento.id}?fecha=${encodeURIComponent(fecha.id)}`);
    } catch (error) {
      if (error.name === "AbortError") return;
      setMensaje(error.message || "No se pudo confirmar la compra. Inténtalo nuevamente.");
    } finally {
      confirmando.current = false;
      setProcesando(false);
    }
  }

  return (
    <>
      <PasosCompra etapa="pago" />
      <a className="pago_volver" href={`#/entradas/${evento.id}?fecha=${encodeURIComponent(fecha.id)}`}>Volver a elegir entradas</a>
      <div className="pago_contenedor">
        {compra.solicitudBackend ? <section><h2>Compra en proceso</h2>
          <p>Consulta el estado de tu compra para continuar.</p>
          <button disabled={procesando} onClick={() => continuarAConfirmacion()}>Consultar compra</button>
        </section> : <FormularioPago usuario={usuario} comprador={compra.comprador}
          onValidado={continuarAConfirmacion} />}
        <ResumenPago evento={evento} fecha={fecha} seleccion={compra}
          cantidad={compra.cantidad} bloqueado={procesando || Boolean(compra.solicitudBackend)} />
      </div>
      <p className="txt_error" role="status">{mensaje}</p>
    </>
  );
}
export default PaginaPago;
