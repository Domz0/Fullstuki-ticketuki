import { useEffect, useState } from "react";
import { apiAdmin } from "../services/admin";

export function useAdminDatos(ruta) {
  const [estado, setEstado] = useState({ datos: null, error: "", cargando: true });
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    apiAdmin(ruta, { signal: controller.signal }).then(datos => {
      if (!controller.signal.aborted) setEstado({ datos, error: "", cargando: false });
    }).catch(error => {
      if (!controller.signal.aborted) setEstado({ datos: null, error: error.message, cargando: false });
    });
    return () => controller.abort();
  }, [ruta, intento]);
  return { ...estado, recargar: () => {
    setEstado({ datos: null, error: "", cargando: true }); setIntento(i => i + 1);
  } };
}
