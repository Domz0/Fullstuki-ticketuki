// Toda lectura del JSON de sesión pasa por esta función.
export function sesionGuardada() {
  try {
    return JSON.parse(localStorage.getItem("sesionBackend") || "null");
  } catch {
    // si el navegador conserva un registro no valido , se toma como que no hay sesion
    return null;
  }
}

export function mismaSesion(sesion, token) {
  return Boolean(token) && (sesion?.token === token || sesion?.tokenAnterior === token);
}

export function limpiarDatosPrivados() {
  sessionStorage.removeItem("compraActual");
}

export function expirarSesion(token) {
  const actual = sesionGuardada();

  // una respuesta atrasada no debe cerrar una sesión nueva.
  if (token && actual?.token !== token) return;

  localStorage.removeItem("sesionBackend");
  limpiarDatosPrivados();
  window.dispatchEvent(new CustomEvent("sesion-vencida"));
}
