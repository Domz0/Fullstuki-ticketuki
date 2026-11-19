export function sesionGuardada() {
  try { return JSON.parse(localStorage.getItem("sesionBackend") || "null"); } catch { return null; }
}

export function limpiarDatosPrivados() {
  sessionStorage.removeItem("compraActual");
  sessionStorage.removeItem("catalogoBackend");
  localStorage.removeItem("compraActual");
}

export function expirarSesion(token) {
  const actual = sesionGuardada();

  if (token && actual?.token !== token) return;
  localStorage.removeItem("sesionBackend");
  limpiarDatosPrivados();
  window.dispatchEvent(new CustomEvent("sesion-vencida"));
}
