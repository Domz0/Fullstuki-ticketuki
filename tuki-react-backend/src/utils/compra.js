export function calcularTotales(precio, cantidad, codigo = "") {
  const subtotal = precio * cantidad;
  const cargo = Math.round(precio * 0.1) * cantidad;
  const iva = Math.round(precio * 0.19) * cantidad;
  const descuento = codigo === "ROCK20" ? Math.round((subtotal + cargo) * 0.2) : 0;
  return { subtotal, cargo, iva, descuento, total: subtotal + iva + cargo - descuento };
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

export function limpiarComprador(comprador) {
  const primerNombre = comprador.nombre.trim();
  const segundoNombre = comprador.segundoNombre?.trim() || "";
  const apellidoPaterno = comprador.apellido.trim();
  const apellidoMaterno = comprador.apellidoMaterno?.trim() || "";
  return {
    primerNombre, segundoNombre, apellidoPaterno, apellidoMaterno,
    nombre: [primerNombre, segundoNombre].filter(Boolean).join(" "),
    apellido: [apellidoPaterno, apellidoMaterno].filter(Boolean).join(" "),
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
