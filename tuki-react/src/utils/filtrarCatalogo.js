export function filtrarCatalogo(eventos, filtros, busqueda, orden) {
  return eventos
    .filter((evento) => {
      if (
        ![evento.nombre, evento.recinto, evento.ciudad]
          .join(" ")
          .toLowerCase()
          .includes(busqueda.trim().toLowerCase())
      )
        return false;
      for (const grupo of ["subcategoria", "ciudad", "recinto"]) {
        if (filtros[grupo] && evento[grupo] !== filtros[grupo]) return false;
      }
      if (evento.fechaInicio && filtros.plazo) {
        const dias = (new Date(evento.fechaInicio) - new Date()) / 86400000;
        const limites = { 1: 7, 2: 30, 3: 90 };
        return dias >= 0 && dias <= limites[filtros.plazo];
      }
      return !filtros.plazo || evento.plazo <= Number(filtros.plazo);
    })
    .sort((a, b) =>
      orden === "precio" ? a.precio - b.precio : a.plazo - b.plazo,
    );
}
