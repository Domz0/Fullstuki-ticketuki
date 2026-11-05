export function resumirCompras(compras) {
  const confirmadas = compras.filter((compra) => compra.estado === "confirmada");
  return {
    cantidad: confirmadas.length,
    recaudado: confirmadas.reduce((total, compra) => total + compra.total, 0),
    cargos: confirmadas.reduce((total, compra) => total + compra.cargo, 0),
  };
}
