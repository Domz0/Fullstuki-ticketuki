export function calcularTotales(precio, cantidad, codigo = "") {
  const subtotal = precio * cantidad;
  const cargo = Math.round(subtotal * 0.1);
  const descuento = codigo === "ROCK20" ? Math.round((subtotal + cargo) * 0.2) : 0;
  return { subtotal, cargo, descuento, total: subtotal + cargo - descuento };
}

export function leerCompra() {
  try {
    return JSON.parse(localStorage.getItem("compraActual")) || null;
  } catch {
    return null;
  }
}

export function guardarCompra(compra) {
  localStorage.setItem("compraActual", JSON.stringify(compra));
}

export function crearSeleccion(evento, fecha, sector, cantidad) {
  return {
    eventoId: evento.id,
    evento: evento.nombre,
    recinto: evento.recinto,
    fechaId: fecha.id,
    fecha: `${fecha.dia} ${fecha.mes}${fecha.horario ? " · " + fecha.horario : ""}`,
    sectorId: sector.id,
    area: sector.nombre,
    precio: sector.precio,
    cantidad: Math.max(1, Math.min(6, cantidad)),
    estado: "seleccion",
    codigoDescuento: "",
  };
}

function limpiarComprador(comprador) {
  return {
    nombre: comprador.nombre.trim(),
    apellido: comprador.apellido.trim(),
    rut: comprador.rut.trim(),
    correo: comprador.correo.trim(),
  };
}

export function rechazarCompra(compra, comprador, metodo, motivo) {
  return {
    ...compra,
    ...calcularTotales(compra.precio, compra.cantidad, compra.codigoDescuento),
    comprador: limpiarComprador(comprador),
    metodo,
    estado: "rechazada",
    motivo,
  };
}

export function confirmarCompra(compra, comprador, metodo, cuotas) {
  const referencia = crypto.randomUUID().toUpperCase();
  return {
    ...compra,
    ...calcularTotales(compra.precio, compra.cantidad, compra.codigoDescuento),
    comprador: limpiarComprador(comprador),
    motivo: undefined,
    metodo,
    cuotas: metodo === "credito" ? cuotas : 1,
    estado: "confirmada",
    orden: `TKI-${referencia.slice(0, 13)}`,
    codigo: `TKI-${referencia.slice(0, 8)}`,
  };
}
