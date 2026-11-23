import { peticionApi } from "../services/api";
import { expirarSesion, limpiarDatosPrivados, mismaSesion, sesionGuardada } from "./controlSesion";

function sesionVigente(sesion) {
  return Boolean(
    sesion?.token && sesion.usuario && sesion.expiraEn > Date.now(),
  );
}

export function obtenerUsuario() {
  const sesion = sesionGuardada();
  if (!sesionVigente(sesion)) return null;
  return sesion.usuario;
}

export async function iniciarSesion(datos) {
  const respuesta = await peticionApi("/auth/login", {
    method: "POST",
    body: {
      username: datos.username.trim().toLowerCase(),
      password: datos.password,
    },
  });
  if (!respuesta?.token || !respuesta.username || !(respuesta.expiraEnMs > 0)) {
    throw new Error("El servidor devolvió una sesión inválida.");
  }

  // el login identifica la cuenta, los datos personales se cargan desde el perfil
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
  const sesion = {
    token: respuesta.token,
    usuario,
    expiraEn: Date.now() + respuesta.expiraEnMs,
  };
  localStorage.setItem("sesionBackend", JSON.stringify(sesion));
  return usuario;
}


export async function renovarSesion() {
  const sesion = leerSesion();
  const respuesta = await peticionApi("/auth/refresh", { method: "POST", token: sesion.token });
  if (!respuesta?.token || !(respuesta.expiraEnMs > 0)) {
    throw new Error("El servidor devolvió una sesión inválida.");
  }

  // no reemplaza una sesion que se cerro o cambio mientras se renovaba
  if (sesionGuardada()?.token !== sesion.token) return null;
  const renovada = {
    ...sesion,
    token: respuesta.token,
    tokenAnterior: sesion.token,
    expiraEn: Date.now() + respuesta.expiraEnMs,
  };
  localStorage.setItem("sesionBackend", JSON.stringify(renovada));
  return renovada;
}

export function cerrarSesion() {
  localStorage.removeItem("sesionBackend");
  limpiarDatosPrivados();
  window.dispatchEvent(new CustomEvent("sesion-cerrada"));
}

// las operaciones privadas necesitan una sesion iniciada
export function leerSesion() {
  const sesion = sesionGuardada();
  if (!sesionVigente(sesion)) {
    expirarSesion(sesion?.token);
    throw new Error("Tu sesión terminó. Vuelve a iniciar sesión.");
  }
  return sesion;
}

export async function cargarPerfil() {
  const sesion = leerSesion();
  const perfil = await peticionApi(`/usuarios/${sesion.usuario.usuarioId}`, {
    token: sesion.token,
  });
  const usuario = {
    ...sesion.usuario,
    primerNombre: perfil.p_nombre || "",
    segundoNombre: perfil.s_nombre || "",
    apellidoPaterno: perfil.a_paterno || "",
    apellidoMaterno: perfil.a_materno || "",
    nombre: unirNombres(perfil.p_nombre, perfil.s_nombre),
    apellido: unirNombres(perfil.a_paterno, perfil.a_materno),
    rut: perfil.run || "",
    correo: perfil.email || "",
  };

  // no guarda un perfil si el usuario cerro o cambio su sesion
  const actual = sesionGuardada();
  if (!mismaSesion(actual, sesion.token)) {
    throw new Error("La sesión cambió. Vuelve a cargar tu perfil.");
  }
  localStorage.setItem("sesionBackend", JSON.stringify({ ...actual, usuario }));
  return usuario;
}

function unirNombres(primero, segundo) {
  return [primero, segundo]
    .map(parte => parte?.trim())
    .filter(Boolean)
    .join(" ");
}

export async function cambiarContrasena(datos) {
  const sesion = leerSesion();
  await peticionApi("/auth/contrasena", {
    method: "PATCH",
    token: sesion.token,
    body: { actual: datos.actual, nueva: datos.nueva },
  });
  cerrarSesion();
}

// nombre e iniciales
export function nombreVisible(usuario) {
  const completo = unirNombres(usuario.nombre, usuario.apellido);
  return completo || usuario.username;
}

export function inicialesUsuario(usuario) {
  const nombre = usuario.nombre?.trim();
  const apellido = usuario.apellido?.trim();
  if (nombre && apellido) return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
  return (nombre || usuario.username || "").slice(0, 2).toUpperCase();
}
