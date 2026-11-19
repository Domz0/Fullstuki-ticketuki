export function navegar(ruta) {
  window.location.hash = ruta;
}

// Ejemplo: #/evento/5?fecha=principal se divide en pantalla, id y parámetros.
export function leerRuta(hash) {
  const ruta = hash.replace(/^#/, "") || "/inicio";
  const [camino, consulta = ""] = ruta.split("?");
  const partes = camino.split("/").filter(Boolean);

  return {
    pantalla: partes[0] || "inicio",
    id: partes[1],
    parametros: new URLSearchParams(consulta),
  };
}
