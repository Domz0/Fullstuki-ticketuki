export function normalizarRut(rut) {
  return rut.trim().replaceAll(".", "").toUpperCase();
}

export function leerCompras() {
  const compras = JSON.parse(localStorage.getItem("compras") || "[]");
  return Array.isArray(compras) ? compras : [];
}

export function guardarEntrada(compra, usuario) {
  if (compra.estado !== "confirmada") return;
  const compras = leerCompras();
  if (compras.some((guardada) => guardada.orden === compra.orden)) return;
  const titularRut = normalizarRut(usuario?.rut || compra.comprador.rut);
  compras.push({ ...compra, titularRut });
  localStorage.setItem("compras", JSON.stringify(compras));
}

export function obtenerEntradas(usuario) {
  if (!usuario) return [];
  const rut = normalizarRut(usuario.rut);
  return leerCompras()
    .filter((compra) => compra.titularRut === rut)
    .reverse()
    .map((compra) => ({
      estado: compra.transferencia ? "transferidas" : "proximas",
      rotulo: compra.transferencia ? `Transferida a ${compra.transferencia.correo}` : "Próximo evento",
      eventoId: compra.eventoId,
      nombre: compra.evento,
      recinto: compra.recinto,
      fecha: compra.fecha,
      sector: `${compra.area} · ${compra.cantidad} ${compra.cantidad === 1 ? "entrada" : "entradas"}`,
      codigo: compra.codigo,
      orden: compra.orden,
    }));
}

export function transferirEntrada(codigo, destinatario, usuario) {
  const rut = normalizarRut(usuario.rut);
  const compras = leerCompras();
  const compra = compras.find(
    (item) => item.codigo === codigo && item.titularRut === rut && !item.transferencia,
  );
  if (!compra) return false;
  compra.transferencia = {
    nombre: destinatario.nombre.trim(),
    rut: normalizarRut(destinatario.rut),
    correo: destinatario.correo.trim().toLowerCase(),
  };
  localStorage.setItem("compras", JSON.stringify(compras));
  return true;
}
