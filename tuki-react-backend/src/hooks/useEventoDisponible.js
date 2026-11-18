import { useEffect, useState } from "react";
import { cargarEventoDisponible } from "../services/eventos";

export function useEventoDisponible(id) {
  const [estado, setEstado] = useState({ evento: null, error: "", cargando: true });
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    let vigente = true;
    let consultando = false;
    async function actualizar() {
      if (consultando) return;
      consultando = true;
      try {
        const evento = await cargarEventoDisponible(id);
        if (vigente) setEstado({ evento, error: "", cargando: false });
      } catch (error) {
        if (vigente) setEstado({ evento: null, error: error.message, cargando: false });
      } finally { consultando = false; }
    }
    actualizar();
    const intervalo = setInterval(actualizar, 30000);
    window.addEventListener("focus", actualizar);
    return () => { vigente = false; clearInterval(intervalo); window.removeEventListener("focus", actualizar); };
  }, [id, intento]);
  return { ...estado, reintentar: () => { setEstado({ evento: null, error: "", cargando: true }); setIntento(i => i + 1); } };
}
