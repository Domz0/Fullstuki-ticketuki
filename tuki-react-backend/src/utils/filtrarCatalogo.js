export function filtrarCatalogo(eventos, filtros, busqueda, orden) {
  const textoBuscado = busqueda.trim().toLowerCase();
  const eventosFiltrados = eventos.filter(evento => {
    const textoEvento = [evento.nombre, evento.recinto, evento.ciudad]
      .join(" ")
      .toLowerCase();
    if (!textoEvento.includes(textoBuscado)) return false;

    for (const campo of ["subcategoria", "ciudad", "recinto"]) {
      if (filtros[campo] && evento[campo] !== filtros[campo]) return false;
    }

    return cumplePlazo(evento, filtros.plazo);
  });

  // crea lista segu filtro
  return eventosFiltrados.sort((primero, segundo) => {
    if (orden === "precio") {
      return (primero.precio ?? Infinity) - (segundo.precio ?? Infinity);
    }
    if (primero.fechaInicio && segundo.fechaInicio) {
      return new Date(primero.fechaInicio) - new Date(segundo.fechaInicio);
    }
    return primero.plazo - segundo.plazo;
  });
}

function cumplePlazo(evento, plazo) {
  if (!plazo) return true;
  if (!evento.fechaInicio) return evento.plazo <= Number(plazo);

  const limitesEnDias = { 1: 7, 2: 30, 3: 90 };
  const milisegundosPorDia = 24 * 60 * 60 * 1000;
  const diasHastaEvento = (new Date(evento.fechaInicio) - new Date()) / milisegundosPorDia;
  return diasHastaEvento >= 0 && diasHastaEvento <= limitesEnDias[plazo];
}
