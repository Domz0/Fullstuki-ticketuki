import { useEffect, useState } from "react";
import PasosCompra from "../components/PasosCompra";
import Confirmacion from "../components/Confirmacion";
import { leerCompra, guardarCompra } from "../utils/compra";
import { consultarResultado } from "../services/compras";

export default function PaginaConfirmacion({ evento, fecha }) {
  const [consulta, setConsulta] = useState({ cargando: true, error: "", compra: null });
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    const controlador = new AbortController();
    async function cargar() {
      try {
        const pendiente = leerCompra();
        if (!pendiente || String(pendiente.eventoId) !== String(evento.id) || pendiente.fechaId !== fecha.id)
          throw new Error("No hay una compra recuperable para este evento en esta pestaña. El acceso local pudo vencer; las entradas emitidas permanecen en el servidor.");
        const compra = await consultarResultado(pendiente, controlador.signal);
        if (controlador.signal.aborted) return;
        guardarCompra(compra);
        setConsulta({ cargando: false, error: "", compra });
      } catch (error) {
        if (!controlador.signal.aborted) setConsulta({ cargando: false, error: error.message, compra: null });
      }
    }
    cargar();
    return () => controlador.abort();
  }, [evento.id, fecha.id, intento]);
  if (consulta.cargando) return <section className="pago_cargando" role="status"><span className="pago_cargando_circulo" aria-hidden="true" /><h2>Verificando tu compra</h2><p>Consultando las entradas emitidas…</p></section>;
  if (consulta.error) return <section><p role="alert">{consulta.error}</p><button className="pago_volver" onClick={() => {
    setConsulta({ cargando: true, error: "", compra: null }); setIntento(i => i + 1);
  }}>Reintentar consulta</button><a className="pago_volver" href="#/inicio">Volver al inicio</a></section>;
  const compra = consulta.compra;
  if (compra.estado !== "confirmada") return <section><h2>{compra.estado === "rechazada" ? "Compra no completada" : "Compra pendiente"}</h2>
    <p>{compra.motivo || "El servidor aún no confirma la emisión de tus entradas."}</p>
    <a className="pago_volver" href={`#/${compra.estado === "rechazada" ? "pago-fallido" : "pago"}/${evento.id}?fecha=${fecha.id}`}>Consultar compra</a></section>;
  const metodos = { debito: "Débito", credito: "Crédito", transferencia: "Transferencia bancaria" };
  return <><PasosCompra etapa="confirmacion" /><Confirmacion compra={{ ...compra, evento: evento.nombre, recinto: evento.recinto,
    fecha: [evento.fechaInicio?.slice(0, 10), fecha.horario].filter(Boolean).join(" · "), metodoPago: metodos[compra.metodo] }} /></>;
}
