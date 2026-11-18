export async function peticionApi(ruta, { method = "GET", body, token } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(`/api/${ruta.replace(/^\/+/, "")}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Inténtalo nuevamente.");
  }

  const texto = await respuesta.text();
  let datos = null;
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      if (respuesta.ok) {
        throw new Error("El servidor devolvió una respuesta que no es JSON.");
      }
    }
  }

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
