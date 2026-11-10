export function navegar(ruta) {
  window.location.hash = ruta;
}

export function leerRuta(hash) {
  const [camino, consulta = ""] = (hash.replace(/^#/, "") || "/inicio").split(
    "?",
  );
  const partes = camino.split("/").filter(Boolean);
  return {
    pantalla: partes[0] || "inicio",
    id: partes[1],
    parametros: new URLSearchParams(consulta),
  };
}
