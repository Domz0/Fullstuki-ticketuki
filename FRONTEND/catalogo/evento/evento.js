const contenedor = document.querySelector("#evento_mapa");
const recinto = window.Recinto.RECINTOS.estadio;

window.Recinto.dibujarVistaPrevia(contenedor, recinto);

document.querySelector("#evento_resumen_recinto").textContent =
  `${recinto.nombre} · ${recinto.sectores.length} áreas disponibles`;
