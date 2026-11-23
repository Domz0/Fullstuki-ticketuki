// las duraciones están expresadas en milisegundos
const DURACION_SELECCION = 30 * 60 * 1000;
const DURACION_OPERACION = 24 * 60 * 60 * 1000;

// guardamos solo lo necesario para recuperar la operación
const CAMPOS_COMPRA = [
  "compraId", "creadaEn", "eventoId", "evento", "recinto", "fechaId", "fecha",
  "sectorId", "area", "precio", "cantidad", "estado", "codigoDescuento",
  "porcentajeDescuento", "comprador", "metodo", "cuotas", "accesoCompra",
  "solicitudBackend", "operacionBackend", "motivo", "cuentaCompra",
];

export function calcularTotales(precio, cantidad, porcentaje = 0) {
  const subtotal = precio * cantidad;
  const descuentoPorEntrada = Math.round(precio * (Number(porcentaje) || 0) / 100);
  const precioConDescuento = precio - descuentoPorEntrada;
  const cargo = Math.round(precioConDescuento * 0.1) * cantidad;
  const iva = Math.round(precioConDescuento * 0.19) * cantidad;
  const descuento = descuentoPorEntrada * cantidad;
  const total = subtotal + iva + cargo - descuento;

  return { subtotal, cargo, iva, descuento, total };
}

export function leerCompra() {
  try {
    const compra = JSON.parse(sessionStorage.getItem("compraActual") || "null");
    const formatoValido = compra?.version === 2 && compra.compraId;
    const vigente = Number.isFinite(compra?.venceEn) && compra.venceEn > Date.now();

    if (!formatoValido || !vigente) {
      sessionStorage.removeItem("compraActual");
      return null;
    }
    return compra;
  } catch {
    // un registro dañado no se puede usar para continuar el pago.
    sessionStorage.removeItem("compraActual");
    return null;
  }
}

export function guardarCompra(compra) {
  const anterior = leerCompra();
  const mismaCompra = anterior?.compraId === compra.compraId;

  if (anterior && !mismaCompra && anterior.estado === "procesando") {
    throw new Error("Hay una compra pendiente en esta pestaña. Consúltala antes de iniciar otra.");
  }
  if (compra.estado !== "seleccion" && !mismaCompra) {
    throw new Error("La compra venció o cambió. Vuelve a revisar tus entradas.");
  }

  // recuperar una compra no debe reiniciar su plazo de vencimiento
  let operacionDesde = null;
  if (mismaCompra && anterior.operacionDesde) {
    operacionDesde = anterior.operacionDesde;
  } else if (compra.solicitudBackend) {
    operacionDesde = Date.now();
  }

  let venceEn = compra.creadaEn + DURACION_SELECCION;
  if (operacionDesde) {
    venceEn = operacionDesde + DURACION_OPERACION;
  }
  if (!Number.isFinite(venceEn) || venceEn <= Date.now()) {
    throw new Error("La selección venció. Elige tus entradas nuevamente.");
  }

  const guardada = {};
  for (const campo of CAMPOS_COMPRA) {
    if (compra[campo] !== undefined) {
      guardada[campo] = compra[campo];
    }
  }
  guardada.version = 2;
  guardada.operacionDesde = operacionDesde;
  guardada.venceEn = venceEn;

  sessionStorage.setItem("compraActual", JSON.stringify(guardada));
  return guardada;
}

// ej: "14 nov 2026 puntito 20:00"
export function textoFecha(fecha) {
  const dia = [fecha.dia, fecha.mes, fecha.anio].filter(Boolean).join(" ") || "Fecha por confirmar";
  return fecha.horario ? `${dia} · ${fecha.horario}` : dia;
}

export function crearSeleccion(evento, fecha, sector, cantidad) {
  const fechaVisible = textoFecha(fecha);

  return {
    compraId: crypto.randomUUID(),
    creadaEn: Date.now(),
    eventoId: evento.id,
    evento: evento.nombre,
    recinto: evento.recinto,
    fechaId: fecha.id,
    fecha: fechaVisible,
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
    primerNombre,
    segundoNombre,
    apellidoPaterno,
    apellidoMaterno,
    nombre: [primerNombre, segundoNombre].filter(Boolean).join(" "),
    apellido: [apellidoPaterno, apellidoMaterno].filter(Boolean).join(" "),
    rut: comprador.rut.trim(),
    correo: comprador.correo.trim(),
  };
}

// prepara los datos que muestra la pantalla de pago fallido
export function rechazarCompra(compra, comprador, metodo, motivo) {
  const totales = calcularTotales(compra.precio, compra.cantidad, compra.porcentajeDescuento);
  return {
    ...compra,
    ...totales,
    comprador: limpiarComprador(comprador),
    metodo,
    estado: "rechazada",
    motivo,
  };
}
