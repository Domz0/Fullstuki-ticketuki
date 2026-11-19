import { useEffect, useState } from "react";
import { apiAdmin } from "../services/admin";

export function useAdminDatos(ruta) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [intento, setIntento] = useState(0);

  // consulta al abrir la pantalla, cambiar la ruta o pulsar recargar
  useEffect(() => {
    const controlador = new AbortController();

    async function cargarDatos() {
      try {
        const respuesta = await apiAdmin(ruta, { signal: controlador.signal });
        if (controlador.signal.aborted) return;
        setDatos(respuesta);
        setError("");
      } catch (fallo) {
        if (controlador.signal.aborted) return;
        setDatos(null);
        setError(fallo.message);
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }

    cargarDatos();
    // al salir cancela la consulta para no actualizar una pantalla anterior
    return () => controlador.abort();
  }, [ruta, intento]);

  function recargar() {
    setDatos(null);
    setError("");
    setCargando(true);
    setIntento(anterior => anterior + 1);
  }

  return { datos, error, cargando, recargar };
}
