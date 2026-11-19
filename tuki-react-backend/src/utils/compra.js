export function calcularTotales(precio, cantidad, porcentaje = 0) {
  const subtotal = precio * cantidad;
  const porEntrada = Math.round(precio * (Number(porcentaje) || 0) / 100);
  const cargo = Math.round((precio - porEntrada) * 0.1) * cantidad;
  const iva = Math.round((precio - porEntrada) * 0.19) * cantidad;
  const descuento = porEntrada * cantidad;
  return { subtotal, cargo, iva, descuento, total: subtotal + iva + cargo - descuento };
}

const MINUTOS_SELECCION = 30 * 60 * 1000;
const HORAS_OPERACION = 24 * 60 * 60 * 1000;

export function leerCompra() {
  try {
    const compra = JSON.parse(sessionStorage.getItem("compraActual") || "null");
    if (!compra || compra.version !== 2 || !compra.compraId || !Number.isFinite(compra.venceEn) || compra.venceEn <= Date.now()) {
      sessionStorage.removeItem("compraActual"); return null;
    }
    return compra;
  } catch { sessionStorage.removeItem("compraActual"); return null; }
}

export function guardarCompra(compra) {
  const anterior = leerCompra();
  if (anterior && anterior.compraId !== compra.compraId && anterior.estado === "procesando")
    throw new Error("Hay una compra pendiente en esta pestaña. Consúltala antes de iniciar otra.");
  if (compra.estado !== "seleccion" && anterior?.compraId !== compra.compraId)
    throw new Error("La compra venció o cambió. Vuelve a revisar tus entradas.");
  const operacionDesde = (anterior?.compraId === compra.compraId && anterior.operacionDesde) || (compra.solicitudBackend ? Date.now() : null);
  const guardada = {};
  // Nunca se guardan datos de tarjeta ni se usa una lista local de tickets como comprobante.
  for (const campo of ["compraId", "creadaEn", "eventoId", "evento", "recinto", "fechaId", "fecha", "sectorId", "area", "precio",
    "cantidad", "estado", "codigoDescuento", "porcentajeDescuento", "comprador", "metodo", "cuotas", "accesoCompra", "solicitudBackend", "operacionBackend", "motivo", "cuentaCompra"])
    if (compra[campo] !== undefined) guardada[campo] = compra[campo];
  guardada.version = 2;
  guardada.operacionDesde = operacionDesde;
  guardada.venceEn = operacionDesde ? operacionDesde + HORAS_OPERACION : compra.creadaEn + MINUTOS_SELECCION;
  if (!Number.isFinite(guardada.venceEn) || guardada.venceEn <= Date.now()) throw new Error("La selección venció. Elige tus entradas nuevamente.");
  sessionStorage.setItem("compraActual", JSON.stringify(guardada));
  return guardada;
}

export function migrarCompraAnterior() {
  const anterior = localStorage.getItem("compraActual");
  if (!anterior) return;
  let compra;
  try {
    compra = JSON.parse(anterior);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    localStorage.removeItem("compraActual");
    return;
  }
  try {
    if (!sessionStorage.getItem("compraActual") && compra?.solicitudBackend?.clave && /^[a-f0-9]{64}$/.test(compra.accesoCompra)) {
      const seleccion = { ...compra, compraId: crypto.randomUUID(), creadaEn: Date.now(), estado: "seleccion" };
      guardarCompra(seleccion);
      guardarCompra({ ...seleccion, estado: compra.estado });
    }
  } finally { localStorage.removeItem("compraActual"); }
}

export function crearSeleccion(evento, fecha, sector, cantidad) {
  return {
    compraId: crypto.randomUUID(),
    creadaEn: Date.now(),
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
    ...calcularTotales(compra.precio, compra.cantidad, compra.porcentajeDescuento),
    comprador: limpiarComprador(comprador),
    metodo,
    estado: "rechazada",
    motivo,
  };
}
