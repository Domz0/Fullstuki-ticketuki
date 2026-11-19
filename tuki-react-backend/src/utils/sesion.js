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

export function leerSesion() {
  const sesion = JSON.parse(localStorage.getItem("sesionBackend") || "null");
  if (!obtenerUsuario()) throw new Error("Tu sesión terminó. Vuelve a iniciar sesión.");
  return sesion;
}

export async function cargarPerfil() {
  const sesion = leerSesion();
  const perfil = await peticionApi(`/usuarios/${sesion.usuario.usuarioId}`, { token: sesion.token });
  const unir = (...partes) => partes.map(parte => parte?.trim()).filter(Boolean).join(" ");
  const usuario = {
    ...sesion.usuario,
    primerNombre: perfil.p_nombre || "",
    segundoNombre: perfil.s_nombre || "",
    apellidoPaterno: perfil.a_paterno || "",
    apellidoMaterno: perfil.a_materno || "",
    nombre: unir(perfil.p_nombre, perfil.s_nombre),
    apellido: unir(perfil.a_paterno, perfil.a_materno),
    rut: perfil.run || "",
    correo: perfil.email || "",
  };
  if (JSON.parse(localStorage.getItem("sesionBackend") || "null")?.token !== sesion.token)
    throw new Error("La sesión cambió. Vuelve a cargar tu perfil.");
  localStorage.setItem("sesionBackend", JSON.stringify({ ...sesion, usuario }));
  return usuario;
}

export async function cambiarContrasena(datos) {
  const sesion = leerSesion();
  await peticionApi("/auth/contrasena", {
    method: "PATCH", token: sesion.token,
    body: { actual: datos.actual, nueva: datos.nueva },
  });
  cerrarSesion();
}
