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
      return !filtros.plazo || evento.plazo <= Number(filtros.plazo);
    })
    .sort((a, b) =>
      orden === "precio" ? a.precio - b.precio : a.plazo - b.plazo,
    );
}
