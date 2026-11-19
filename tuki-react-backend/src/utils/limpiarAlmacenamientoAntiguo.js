export function limpiarAlmacenamientoAntiguo() {
  const claves = ["nombre", "apellido", "rut", "correo", "password", "miembroDesde",
    "sesionIniciada", "rol", "compras", "eventosCreados"];
  for (const clave of claves) {
    try { localStorage.removeItem(clave); } catch { /* Puede estar bloqueado por el navegador. */ }
  }
}
