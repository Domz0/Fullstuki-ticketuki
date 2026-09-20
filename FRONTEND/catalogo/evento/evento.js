const contenedor = document.querySelector("[data-mapa]");
const recinto = window.Recinto.RECINTOS.estadio;

window.Recinto.dibujarVistaPrevia(contenedor, recinto);

document.querySelector("[data-resumen-recinto]").textContent =
  `${recinto.nombre} · ${recinto.sectores.length} áreas disponibles`;
