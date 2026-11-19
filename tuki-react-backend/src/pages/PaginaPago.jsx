import { useEffect, useRef, useState } from "react";
import "./PaginaPago.css";
import PasosCompra from "../components/PasosCompra";
import FormularioPago from "../components/FormularioPago";
import ResumenPago from "../components/ResumenPago";
import { leerCompra, guardarCompra, rechazarCompra } from "../utils/compra";
import { tarjetaVencida } from "../utils/validarPago";
import { prepararCompra, procesarCompra, consultarCompra } from "../services/compras";
import { navegar } from "../utils/navegacion";
import { peticionApi } from "../services/api";

function PaginaPago({ evento, fecha, usuario }) {
  const [compra, setCompra] = useState(leerCompra);
  const [mensaje, setMensaje] = useState("");
  const confirmando = useRef(false);
  const consulta = useRef(null);
  useEffect(() => () => consulta.current?.abort(), []);
  const [procesando, setProcesando] = useState(false);
  const [recuperando, setRecuperando] = useState(() => Boolean(leerCompra()?.solicitudBackend));
  useEffect(() => {
    const pendiente = leerCompra();
    if (!pendiente?.solicitudBackend || String(pendiente.eventoId) !== String(evento.id) || pendiente.fechaId !== fecha.id) return;
    const controlador = new AbortController();
    consultarCompra(pendiente, controlador.signal).then(actualizada => {
      if (controlador.signal.aborted) return;
      guardarCompra(actualizada); setCompra(actualizada);
      if (actualizada.estado === "confirmada") navegar(`/confirmacion/${evento.id}?fecha=${encodeURIComponent(fecha.id)}`);
      else if (actualizada.estado === "rechazada") navegar(`/pago-fallido/${evento.id}?fecha=${encodeURIComponent(fecha.id)}`);
      else setMensaje("Compra recuperada. Puedes continuar la misma operación sin crear otra.");
    }).catch(error => {
      if (!controlador.signal.aborted) setMensaje(error.status === 404 ? "La solicitud todavía no está registrada. Puedes continuar para enviarla con la misma referencia." : error.message);
    }).finally(() => { if (!controlador.signal.aborted) setRecuperando(false); });
    return () => controlador.abort();
  }, [evento.id, fecha.id]);
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
      if (leerCompra()?.compraId !== compra.compraId) throw new Error("La selección venció. Vuelve a elegir tus entradas.");
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
      controlador.signal.throwIfAborted();
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
      {(procesando || recuperando) && (
        <section className="pago_cargando" aria-label="Compra en proceso">
          <span className="pago_cargando_circulo" aria-hidden="true" />
          <h2>{recuperando ? "Recuperando tu compra" : "Procesando tu compra"}</h2>
          <p role="status" aria-live="polite" aria-atomic="true">{recuperando ? "Consultando el estado guardado en el servidor…" : mensaje}</p>
        </section>
      )}
      <div hidden={procesando || recuperando}>
      <PasosCompra etapa="pago" />
      <a className="pago_volver" href={`#/entradas/${evento.id}?fecha=${encodeURIComponent(fecha.id)}`}>Volver a elegir entradas</a>
      <div className="pago_contenedor">
        {compra.solicitudBackend ? <section><h2>Compra en proceso</h2>
          <p>Consulta el estado de tu compra para continuar.</p>
          <button className="pago_volver" disabled={procesando || recuperando} onClick={() => continuarAConfirmacion()}>Continuar compra pendiente</button>
        </section> : <FormularioPago usuario={usuario} comprador={compra.comprador} codigoAplicado={compra.codigoDescuento}
          onAplicarCodigo={async codigo => {
            const promo = codigo ? await peticionApi(`/compras/codigos/validar?evento=${encodeURIComponent(compra.eventoId)}&codigo=${encodeURIComponent(codigo)}`) : null;
            if (leerCompra()?.compraId !== compra.compraId || confirmando.current) throw new Error("La compra cambió. Vuelve a revisar la selección.");
            const actualizada = { ...compra, codigoDescuento: promo?.codigo || "", porcentajeDescuento: promo?.descuento || 0 };
            guardarCompra(actualizada); setCompra(actualizada);
            return promo?.descuento || 0;
          }}
          onValidado={continuarAConfirmacion} />}
        <ResumenPago evento={evento} fecha={fecha} seleccion={compra}
          cantidad={compra.cantidad} bloqueado={procesando || Boolean(compra.solicitudBackend)} />
      </div>
      <p className="txt_error" role="status">{mensaje}</p>
      </div>
    </>
  );
}
export default PaginaPago;
