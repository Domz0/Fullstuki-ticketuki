import { useEffect, useState } from "react";
import { cargarEventoDisponible } from "../services/eventos";

export function useEventoDisponible(id) {
  const [evento, setEvento] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let paginaActiva = true;
    let consultando = false;

    async function actualizarDisponibilidad() {
      if (consultando) return;
      consultando = true;

      try {
        const respuesta = await cargarEventoDisponible(id);
        if (!paginaActiva) return;
        setEvento(respuesta);
        setError("");
      } catch (fallo) {
        if (!paginaActiva) return;
        setEvento(null);
        setError(fallo.message);
      } finally {
        consultando = false;
        if (paginaActiva) setCargando(false);
      }
    }

    actualizarDisponibilidad();
    // refresca los cupos cada 30 segundos y cuando vuelves a la ventana
    const intervalo = setInterval(actualizarDisponibilidad, 30000);
    window.addEventListener("focus", actualizarDisponibilidad);

    return () => {
      // descarta respuestas pendientes y detiene las actualizaciones al salir
      paginaActiva = false;
      clearInterval(intervalo);
      window.removeEventListener("focus", actualizarDisponibilidad);
    };
  }, [id, intento]);

  function reintentar() {
    setEvento(null);
    setError("");
    setCargando(true);
    setIntento(anterior => anterior + 1);
  }

  return { evento, error, cargando, reintentar };
}
