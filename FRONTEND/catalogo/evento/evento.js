/*
  Detalle de evento: dibuja la vista previa del recinto y arma el pie de la
  tarjeta con los datos reales del componente (componentes/recinto/recinto.js).
*/
(() => {
  // El evento de esta pantalla se juega en el Estadio Nacional. Cuando la
  // pagina venga del backend, este id sale del evento.
  const ID_RECINTO = "estadio";

  const contenedor = document.querySelector("[data-mapa]");
  if (!contenedor) return;

  const recinto = window.Recinto.buscarRecinto(ID_RECINTO);

  // Solo lectura y mas compacto que el mapa de la pantalla de entradas.
  window.Recinto.dibujarMapa(contenedor, recinto, { escala: 0.7 });

  const resumen = document.querySelector("[data-resumen-recinto]");
  if (resumen) {
    resumen.textContent = `${recinto.nombre} · ${recinto.sectores.length} áreas disponibles`;
  }
})();
