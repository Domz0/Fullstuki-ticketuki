import { peticionApi } from "../services/api";

export function obtenerUsuario() {
  try {
    const sesion = JSON.parse(localStorage.getItem("sesionBackend"));
    if (!sesion?.token || !sesion.usuario || sesion.expiraEn <= Date.now()) return null;
    return sesion.usuario;
  } catch {
    return null;
  }
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

export async function iniciarSesion(datos) {
  const respuesta = await peticionApi("/auth/login", {
    method: "POST",
    body: { username: datos.username.trim().toLowerCase(), password: datos.password },
  });
  if (!respuesta?.token || !respuesta.username || !(respuesta.expiraEnMs > 0)) {
    throw new Error("El servidor devolvió una sesión inválida.");
  }
  const usuario = {
    username: respuesta.username,
    nombre: respuesta.username,
    apellido: "",
    correo: "",
    rut: "",
    rol: respuesta.rol === "ADMIN" ? "admin" : "cliente",
    authId: respuesta.authId,
    usuarioId: respuesta.usuarioId,
  };
  localStorage.setItem("sesionBackend", JSON.stringify({
    token: respuesta.token, usuario, expiraEn: Date.now() + respuesta.expiraEnMs,
  }));
  localStorage.removeItem("password");
  return usuario;
}

export function cerrarSesion() {
  localStorage.removeItem("sesionBackend");
  localStorage.removeItem("sesionIniciada");
  localStorage.removeItem("rol");
}

export function actualizarDatosAcceso(datos) {
  if (obtenerUsuario()?.rol !== "cliente") return null;
  localStorage.setItem("correo", datos.correo.trim().toLowerCase());
  localStorage.setItem("password", datos.password);
  return obtenerUsuario();
}
