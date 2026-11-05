// Una cuenta local por navegador, igual que en el proyecto original.
export function obtenerUsuario() {
  if (localStorage.getItem("sesionIniciada") !== "true") return null;
  const correo = localStorage.getItem("correo");
  if (!correo) return null;
  return {
    nombre: localStorage.getItem("nombre") || "",
    apellido: localStorage.getItem("apellido") || "",
    rut: localStorage.getItem("rut") || "",
    correo,
    miembroDesde: localStorage.getItem("miembroDesde") || new Date().getFullYear(),
  };
}

export function registrarUsuario(datos) {
  localStorage.setItem("nombre", datos.nombre.trim());
  localStorage.setItem("apellido", datos.apellido.trim());
  localStorage.setItem("rut", datos.rut.trim());
  localStorage.setItem("correo", datos.correo.trim().toLowerCase());
  localStorage.setItem("password", datos.password);
  localStorage.setItem("miembroDesde", String(new Date().getFullYear()));
  localStorage.setItem("sesionIniciada", "false");
  localStorage.removeItem("rol");
}

export function iniciarSesion(datos) {
  const correo = localStorage.getItem("correo");
  const password = localStorage.getItem("password");
  if (
    !correo ||
    datos.correo.trim().toLowerCase() !== correo.toLowerCase() ||
    datos.password !== password
  ) return null;

  localStorage.setItem("sesionIniciada", "true");
  localStorage.setItem("rol", "cliente");
  return obtenerUsuario();
}

export function cerrarSesion() {
  localStorage.setItem("sesionIniciada", "false");
  localStorage.removeItem("rol");
}

export function actualizarDatosAcceso(datos) {
  if (!obtenerUsuario()) return null;
  localStorage.setItem("correo", datos.correo.trim().toLowerCase());
  localStorage.setItem("password", datos.password);
  return obtenerUsuario();
}
