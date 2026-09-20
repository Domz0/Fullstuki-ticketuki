(() => {
  const contenedor = document.querySelector("[data-mapa]");
  if (!contenedor) return;

  const recinto = window.Recinto.RECINTOS.estadio;

  window.Recinto.dibujarMapa(contenedor, recinto, { escala: 0.7 });

  document.querySelector("[data-resumen-recinto]").textContent =
    `${recinto.nombre} · ${recinto.sectores.length} áreas disponibles`;
})();
