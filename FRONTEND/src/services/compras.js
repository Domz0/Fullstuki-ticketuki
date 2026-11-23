import { peticionApi } from "./api";
import { cargarEventoDisponible } from "./eventos";
import { limpiarComprador, leerCompra } from "../utils/compra";
import { obtenerUsuario, leerSesion } from "../utils/sesion";

const estadosRechazados = ["CANCELADA", "REEMBOLSADA", "RESERVA_VENCIDA"];
const mensajesProceso = {
  RESERVANDO: "Reservando tus entradas…",
  PENDIENTE_PAGO: "Confirmando el pago simulado…",
  CONFIRMANDO_PAGO: "Confirmando la reserva…",
  EMITIENDO: "Generando tus entradas…",
  CANCELANDO: "Cancelando la compra…",
  REEMBOLSANDO: "Revirtiendo el pago simulado…",
};

// no permite operacions caducadas
function comprobarCompraActual(compra, signal) {
  signal?.throwIfAborted();
  if (leerCompra()?.compraId !== compra.compraId) {
    throw new DOMException("La compra venció o cambió", "AbortError");
  }
}

function consultarOperacion(compra, ruta, signal, opciones = {}) {
  comprobarCompraActual(compra, signal);
  return peticionApi(`/compras/publicas${ruta}`, {
    ...opciones,
    accesoCompra: compra.accesoCompra,
    signal,
  });
}

// recupera el estado por id o por la clave enviada al crear la compra
export async function consultarCompra(compra, signal) {
  if (!compra?.accesoCompra || !compra.solicitudBackend?.clave) {
    throw new Error("No hay una operación recuperable en esta pestaña.");
  }

  let ruta = `/por-clave/${encodeURIComponent(compra.solicitudBackend.clave)}`;
  if (compra.operacionBackend?.id) {
    ruta = `/${compra.operacionBackend.id}`;
  }

  const operacion = await consultarOperacion(compra, ruta, signal);
  comprobarCompraActual(compra, signal);
  const rechazada = estadosRechazados.includes(operacion.estado);
  let estado = "procesando";
  if (operacion.estado === "COMPLETADA") {
    estado = "confirmada";
  } else if (rechazada) {
    estado = "rechazada";
  }

  let motivo = operacion.mensaje;
  if (!motivo && rechazada) {
    motivo = "La compra no pudo completarse o su reserva venció.";
  }

  return { ...compra, operacionBackend: operacion, estado, motivo };
}

// la confirmacion consulta las entradas reales
export async function consultarResultado(compra, signal) {
  const actualizada = await consultarCompra(compra, signal);
  if (actualizada.estado !== "confirmada") return actualizada;

  const resultado = await consultarOperacion(
    compra, `/${actualizada.operacionBackend.id}/resultado`, signal,
  );
  comprobarCompraActual(compra, signal);
  if (!Array.isArray(resultado.tickets) || !resultado.tickets.length) {
    throw new Error("No se pudieron consultar las entradas emitidas.");
  }

  return {
    ...completarCompra(actualizada, resultado),
    cantidad: resultado.tickets.length,
    comprador: {
      nombre: resultado.comprador.nombre_comprador,
      apellido: "",
      rut: resultado.comprador.rut_comprador,
      correo: resultado.correo,
    },
    metodo: resultado.medio_pago.toLowerCase(),
  };
}

// revisa antes de mandar al backend
export async function prepararCompra(compra, datos, metodo, cuotas) {
  const evento = await cargarEventoDisponible(compra.eventoId);
  const sector = evento.sectores.find(sector => String(sector.id) === String(compra.sectorId));
  const cantidadValida = Number.isInteger(compra.cantidad) && compra.cantidad >= 1 && compra.cantidad <= 6;

  if (!cantidadValida || !evento.ventaHabilitada || !sector || sector.disponibles < compra.cantidad) {
    throw new Error("Ya no hay disponibilidad para esta selección. Vuelve a elegir tus entradas.");
  }
  if (sector.precio !== compra.precio) {
    throw new Error("El precio cambió. Vuelve a elegir tus entradas para revisar el nuevo total.");
  }

  const comprador = limpiarComprador(datos);
  const nombre = `${comprador.nombre} ${comprador.apellido}`;
  if (nombre.length > 50) {
    throw new Error("El nombre del titular supera los 50 caracteres permitidos.");
  }

  const solicitudBackend = {
    clave: crypto.randomUUID(),
    evento: Number(compra.eventoId),
    sector: Number(compra.sectorId),
    cantidad: compra.cantidad,
    nombre,
    rut: formatearRut(datos.rut),
    correo: comprador.correo,
    medio: metodo.toUpperCase(),
    codigo: compra.codigoDescuento || null,
  };

  return {
    ...compra,
    comprador,
    metodo,
    cuotas,
    accesoCompra: crearAccesoCompra(),
    cuentaCompra: obtenerUsuario()?.authId || null,
    estado: "procesando",
    solicitudBackend,
  };
}

function formatearRut(rut) {
  const [cuerpo, digito] = rut.trim().replaceAll(".", "").toUpperCase().split("-");
  const cuerpoConPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cuerpoConPuntos}-${digito}`;
}

function crearAccesoCompra() {
  //permite consultar compras como invitado
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, numero => numero.toString(16).padStart(2, "0")).join("");
}

async function iniciarORecuperarOperacion(compra, signal) {
  if (compra.operacionBackend) {
    return consultarOperacion(compra, `/${compra.operacionBackend.id}`, signal);
  }

  let token;
  if (compra.cuentaCompra) {
    const sesion = leerSesion();
    if (sesion.usuario.authId !== compra.cuentaCompra) {
      throw new Error("La cuenta de esta compra cambió.");
    }
    token = sesion.token;
  }

  return consultarOperacion(compra, "", signal, {
    method: "POST",
    body: compra.solicitudBackend,
    token,
  });
}

function completarCompra(compra, resultado) {
  return {
    ...compra,
    estado: "confirmada",
    total: resultado.total,
    correoEnviado: resultado.correo_enviado,
    orden: `TKI-${resultado.venta_id}`,
    codigo: resultado.tickets.map(ticket => ticket.cod_qr).join(" · "),
    tickets: resultado.tickets,
  };
}

async function obtenerEntradasEmitidas(compra, operacion, signal) {
  const resultado = await consultarOperacion(compra, `/${operacion.id}/resultado`, signal);
  comprobarCompraActual(compra, signal);
  if (!Array.isArray(resultado.tickets) || resultado.tickets.length !== compra.cantidad) {
    throw new Error("La compra está registrada, pero no se pudieron consultar todas las entradas. Reintenta consultar.");
  }
  return completarCompra({ ...compra, operacionBackend: operacion }, resultado);
}

// sigue la misma operación hasta completarla; no crea otra compra en cada consulta
export async function procesarCompra(compra, informar, signal) {
  if (!compra.accesoCompra) {
    throw new Error("Esta selección corresponde al flujo anterior. Vuelve a elegir tus entradas.");
  }

  let operacion = await iniciarORecuperarOperacion(compra, signal);
  for (let intento = 0; intento < 45; intento++) {
    comprobarCompraActual(compra, signal);
    const mensaje = mensajesProceso[operacion.estado] || "Consultando compra…";
    informar({ ...compra, operacionBackend: operacion }, mensaje);

    if (operacion.estado === "COMPLETADA") {
      return obtenerEntradasEmitidas(compra, operacion, signal);
    }
    if (estadosRechazados.includes(operacion.estado)) {
      return {
        ...compra,
        operacionBackend: operacion,
        estado: "rechazada",
        motivo: operacion.mensaje || "La compra no pudo completarse. Selecciona nuevamente tus entradas.",
      };
    }
    if (operacion.estado === "REVISION_REQUERIDA") {
      throw new Error("La compra requiere revisión del administrador. No vuelvas a crearla.");
    }

    if (operacion.estado === "PENDIENTE_PAGO" && operacion.reserva_estado === "RESERVADA") {
      operacion = await consultarOperacion(compra, `/${operacion.id}/confirmar-simulado`, signal, {
        method: "POST",
      });
      if (operacion.estado !== "PENDIENTE_PAGO") continue;
    }

    // se espera solo si el backend esta trabajando
    await new Promise(resolve => setTimeout(resolve, 2000));
    operacion = await consultarOperacion(compra, `/${operacion.id}`, signal);
  }

  throw new Error("Tu compra sigue pendiente. Pulsa Consultar compra para revisar su estado sin duplicarla.");
}
