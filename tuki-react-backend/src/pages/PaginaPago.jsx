import { useEffect, useRef, useState } from "react";
import PasosCompra from "../components/PasosCompra";
import FormularioPago from "../components/FormularioPago";
import ResumenPago from "../components/ResumenPago";
import { leerCompra, guardarCompra, rechazarCompra } from "../utils/compra";
import { tarjetaVencida } from "../utils/validarPago";
import { prepararCompra, procesarCompra, consultarCompra } from "../services/compras";
import { navegar } from "../utils/navegacion";
import { peticionApi } from "../services/api";
import "./PaginaPago.css";

function PaginaPago({ evento, fecha, usuario }) {
  const [compra, setCompra] = useState(leerCompra);
  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [recuperando, setRecuperando] = useState(() => Boolean(leerCompra()?.solicitudBackend));
  const confirmando = useRef(false);
  const consultaPago = useRef(null);

  useEffect(() => {
    return () => {
      // salir detiene consultas, no compras
      consultaPago.current?.abort();
    };
  }, []);

  // al reingresar, busca una compra incompleta antesde ahcer tora
  useEffect(() => {
    const pendiente = leerCompra();
    if (!pendiente?.solicitudBackend) return;

    const mismoEvento = String(pendiente.eventoId) === String(evento.id);
    const mismaFecha = pendiente.fechaId === fecha.id;
    if (!mismoEvento || !mismaFecha) return;

    const controlador = new AbortController();

    async function recuperarCompra() {
      try {
        const actualizada = await consultarCompra(pendiente, controlador.signal);
        if (controlador.signal.aborted) return;

        guardarCompra(actualizada);
        setCompra(actualizada);

        const parametros = "?fecha=" + encodeURIComponent(fecha.id);
        if (actualizada.estado === "confirmada") {
          navegar("/confirmacion/" + evento.id + parametros);
        } else if (actualizada.estado === "rechazada") {
          navegar("/pago-fallido/" + evento.id + parametros);
        } else {
          setMensaje("Compra recuperada. Puedes continuar la misma operación sin crear otra.");
        }
      } catch (fallo) {
        if (controlador.signal.aborted) return;

        if (fallo.status === 404) {
          setMensaje("La solicitud todavía no está registrada. Puedes continuar para enviarla con la misma referencia.");
        } else {
          setMensaje(fallo.message);
        }
      } finally {
        if (!controlador.signal.aborted) {
          setRecuperando(false);
        }
      }
    }

    recuperarCompra();
    return () => controlador.abort();
  }, [evento.id, fecha.id]);

  const parametros = "?fecha=" + encodeURIComponent(fecha.id);
  const mismoEvento = String(compra?.eventoId) === String(evento.id);
  const mismaFecha = compra?.fechaId === fecha.id;

  if (!compra || !mismoEvento || !mismaFecha) {
    return (
      <section>
        <h2>Elige tus entradas primero</h2>
        <a className="pago_volver" href={"#/entradas/" + evento.id + parametros}>
          Elegir entradas
        </a>
      </section>
    );
  }

  function actualizarAvance(compraActualizada, aviso) {
    guardarCompra(compraActualizada);
    setCompra(compraActualizada);
    setMensaje(aviso);
  }

  function mostrarResultado(resultado) {
    if (resultado.estado === "confirmada") {
      navegar("/confirmacion/" + evento.id + parametros);
    } else {
      navegar("/pago-fallido/" + evento.id + parametros);
    }
  }

  async function continuarAConfirmacion(datos, metodo, cuotas) {
    // evita doble envio
    if (confirmando.current) return;

    if (leerCompra()?.compraId !== compra.compraId) {
      setMensaje("La selección venció. Vuelve a elegir tus entradas.");
      return;
    }

    confirmando.current = true;
    const controlador = new AbortController();
    consultaPago.current = controlador;
    setProcesando(true);
    setMensaje("Registrando compra…");

    try {
      const compraNueva = !compra.solicitudBackend;
      const pagoConCredito = metodo === "credito";

      if (compraNueva && pagoConCredito && tarjetaVencida(datos.vencimiento)) {
        const rechazada = rechazarCompra(compra, datos, metodo, "Tarjeta vencida");
        guardarCompra(rechazada);
        mostrarResultado(rechazada);
        return;
      }

      // conserva referencias y el bacend no duplica slicitud
      let pendiente = compra;
      if (compraNueva) {
        pendiente = await prepararCompra(compra, datos, metodo, cuotas);
      }

      if (controlador.signal.aborted) return;
      guardarCompra(pendiente);
      setCompra(pendiente);

      const resultado = await procesarCompra(pendiente, actualizarAvance, controlador.signal);
      if (controlador.signal.aborted) return;

      guardarCompra(resultado);
      setCompra(resultado);
      mostrarResultado(resultado);
    } catch (fallo) {
      if (fallo.name !== "AbortError") {
        setMensaje(fallo.message || "No se pudo confirmar la compra. Inténtalo nuevamente.");
      }
    } finally {
      confirmando.current = false;
      setProcesando(false);
    }
  }

  async function aplicarCodigo(codigo) {
    // los codigos se validan en backend
    let descuento = null;
    if (codigo) {
      const ruta = "/compras/codigos/validar?evento=" + encodeURIComponent(compra.eventoId)
        + "&codigo=" + encodeURIComponent(codigo);
      descuento = await peticionApi(ruta);
    }

    // se muestra el error
    if (leerCompra()?.compraId !== compra.compraId || confirmando.current) {
      throw new Error("La compra cambió. Vuelve a revisar la selección.");
    }

    const compraActualizada = {
      ...compra,
      codigoDescuento: descuento?.codigo || "",
      porcentajeDescuento: descuento?.descuento || 0,
    };

    guardarCompra(compraActualizada);
    setCompra(compraActualizada);
    return compraActualizada.porcentajeDescuento;
  }

  function continuarCompraPendiente() {
    continuarAConfirmacion();
  }

  const esperando = procesando || recuperando;
  const tieneOperacion = Boolean(compra.solicitudBackend);
  let tituloEspera = "Procesando tu compra";
  let mensajeEspera = mensaje;

  if (recuperando) {
    tituloEspera = "Recuperando tu compra";
    mensajeEspera = "Consultando el estado guardado en el servidor…";
  }

  return (
    <>
      {esperando && (
        <section className="pago_cargando" aria-label="Compra en proceso">
          <span className="pago_cargando_circulo" aria-hidden="true" />
          <h2>{tituloEspera}</h2>
          <p role="status" aria-live="polite" aria-atomic="true">{mensajeEspera}</p>
        </section>
      )}
      {/* oculta fomrulario sin borrar datos */}
      <div hidden={esperando}>
        <PasosCompra etapa="pago" />
        <a className="pago_volver" href={"#/entradas/" + evento.id + parametros}>
          Volver a elegir entradas
        </a>
        <div className="pago_contenedor">
          {tieneOperacion && (
            <section>
              <h2>Compra en proceso</h2>
              <p>Consulta el estado de tu compra para continuar.</p>
              <button
                className="pago_volver"
                disabled={esperando}
                onClick={continuarCompraPendiente}
              >
                Continuar compra pendiente
              </button>
            </section>
          )}
          {!tieneOperacion && (
            <FormularioPago
              usuario={usuario}
              comprador={compra.comprador}
              codigoAplicado={compra.codigoDescuento}
              onAplicarCodigo={aplicarCodigo}
              onValidado={continuarAConfirmacion}
            />
          )}
          <ResumenPago
            evento={evento}
            fecha={fecha}
            seleccion={compra}
            cantidad={compra.cantidad}
            bloqueado={procesando || tieneOperacion}
          />
        </div>
        <p className="txt_error" role="status">{mensaje}</p>
      </div>
    </>
  );
}

export default PaginaPago;
