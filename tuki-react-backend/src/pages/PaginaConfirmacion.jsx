import { useEffect, useState } from "react";
import PasosCompra from "../components/comunes/PasosCompra";
import Confirmacion from "../components/compras/Confirmacion";
import { leerCompra, guardarCompra } from "../utils/compra";
import { consultarResultado } from "../services/compras";

function PaginaConfirmacion({ evento, fecha }) {
  const [compra, setCompra] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  // consulta resultados
  useEffect(() => {
    const controlador = new AbortController();

    async function cargarCompra() {
      const compraGuardada = leerCompra();

      if (!compraGuardada) {
        setError("No hay una compra guardada en esta pestaña o su acceso venció. Las entradas emitidas siguen en el servidor.");
        setCargando(false);
        return;
      }

      const mismoEvento = String(compraGuardada.eventoId) === String(evento.id);
      const mismaFecha = compraGuardada.fechaId === fecha.id;

      if (!mismoEvento || !mismaFecha) {
        setError("La compra guardada corresponde a otro evento o función.");
        setCargando(false);
        return;
      }

      try {
        // el backend confirma el estado
        const resultado = await consultarResultado(compraGuardada, controlador.signal);
        if (controlador.signal.aborted) return;

        guardarCompra(resultado);
        setCompra(resultado);
      } catch (fallo) {
        if (!controlador.signal.aborted) {
          setError(fallo.message || "No se pudo consultar la compra.");
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarCompra();

    // al salir se cancela la consulta del navegador, no la compra del servidor
    return () => controlador.abort();
  }, [evento.id, fecha.id, recarga]);

  function reintentarConsulta() {
    setError("");
    setCompra(null);
    setCargando(true);
    setRecarga(recarga + 1);
  }

  if (cargando) {
    return (
      <section className="pago_cargando" role="status">
        <span className="pago_cargando_circulo" aria-hidden="true" />
        <h2>Verificando tu compra</h2>
        <p>Consultando las entradas emitidas…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <p role="alert">{error}</p>
        <button className="pago_volver" onClick={reintentarConsulta}>
          Reintentar consulta
        </button>
        <a className="pago_volver" href="#/inicio">Volver al inicio</a>
      </section>
    );
  }

  const parametros = "?fecha=" + encodeURIComponent(fecha.id);

  if (compra.estado === "rechazada") {
    return (
      <section>
        <h2>Compra no completada</h2>
        <p>{compra.motivo || "La compra fue rechazada."}</p>
        <a className="pago_volver" href={"#/pago-fallido/" + evento.id + parametros}>
          Consultar compra
        </a>
      </section>
    );
  }

  if (compra.estado !== "confirmada") {
    return (
      <section>
        <h2>Compra pendiente</h2>
        <p>{compra.motivo || "El servidor aún no confirma la emisión de tus entradas."}</p>
        <a className="pago_volver" href={"#/pago/" + evento.id + parametros}>
          Consultar compra
        </a>
      </section>
    );
  }

  const metodosPago = {
    debito: "Débito",
    credito: "Crédito",
    transferencia: "Transferencia bancaria",
  };
  const diaEvento = evento.fechaInicio?.slice(0, 10) || "";
  let fechaVisible = diaEvento;

  if (fecha.horario) {
    fechaVisible = diaEvento ? diaEvento + " · " + fecha.horario : fecha.horario;
  }

  const datosConfirmacion = {
    ...compra,
    evento: evento.nombre,
    recinto: evento.recinto,
    fecha: fechaVisible,
    metodoPago: metodosPago[compra.metodo],
  };

  return (
    <>
      <PasosCompra etapa="confirmacion" />
      <Confirmacion compra={datosConfirmacion} />
    </>
  );
}

export default PaginaConfirmacion;
