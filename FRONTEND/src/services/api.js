import { expirarSesion, mismaSesion, sesionGuardada } from "../utils/controlSesion";


export const VERSION_API = "v1";

// punto para mandar JSON, agregar el token y comunicar errores
export async function peticionApi(ruta, opciones = {}) {
  const { method = "GET", body, token, signal, accesoCompra } = opciones;
  const sesion = sesionGuardada();

  if (token && sesion?.token === token && sesion.expiraEn <= Date.now()) {
    expirarSesion(token);
    throw new Error("Tu sesión venció. Inicia sesión nuevamente.");
  }

  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  if (accesoCompra) headers["X-Compra-Token"] = accesoCompra;

  const url = `/api/${VERSION_API}/${ruta.replace(/^\/+/, "")}`;
  let respuesta;
  try {
    respuesta = await fetch(url, {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    // salir cancela consultas, no es error
    if (error.name === "AbortError") throw error;
    throw new Error("No se pudo conectar con el servidor. Inténtalo nuevamente.");
  }

  if (token && respuesta.status === 401) {
    expirarSesion(token);
  }
  if (token && !mismaSesion(sesionGuardada(), token)) {
    // no se pasan datos a sesiones cerradas
    throw new DOMException("La sesión cambió", "AbortError");
  }

  const datos = await leerRespuesta(respuesta);
  if (!respuesta.ok) {
    const error = new Error(
      datos?.message || `No se pudo completar la solicitud (${respuesta.status}).`,
    );
    error.status = respuesta.status;
    error.errors = datos?.errors || {};
    throw error;
  }
  return datos;
}

async function leerRespuesta(respuesta) {
  const texto = await respuesta.text();
  if (!texto) return null;

  try {
    return JSON.parse(texto);
  } catch {
    // maneja errores html del servidor
    if (!respuesta.ok) return null;
    throw new Error("El servidor devolvió una respuesta que no es JSON.");
  }
}
