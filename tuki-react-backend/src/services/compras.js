import { peticionApi } from "./api";
import { cargarEventoDisponible } from "./eventos";
import { limpiarComprador, leerCompra } from "../utils/compra";
import { obtenerUsuario, leerSesion } from "../utils/sesion";

export async function consultarCompra(compra, signal) {
  if (!compra?.accesoCompra || !compra.solicitudBackend?.clave) throw new Error("No hay una operación recuperable en esta pestaña.");
  const ruta = compra.operacionBackend?.id ? `/${compra.operacionBackend.id}` : `/por-clave/${encodeURIComponent(compra.solicitudBackend.clave)}`;
  const operacion = await peticionApi(`/compras/publicas${ruta}`, { accesoCompra: compra.accesoCompra, signal });
  if (leerCompra()?.compraId !== compra.compraId) throw new DOMException("La compra cambió", "AbortError");
  const rechazada = ["CANCELADA", "REEMBOLSADA", "RESERVA_VENCIDA"].includes(operacion.estado);
  return { ...compra, operacionBackend: operacion, estado: operacion.estado === "COMPLETADA" ? "confirmada" : rechazada ? "rechazada" : "procesando",
    motivo: operacion.mensaje || (rechazada ? "La compra no pudo completarse o su reserva venció." : undefined) };
}

export async function consultarResultado(compra, signal) {
  const actualizada = await consultarCompra(compra, signal);
  if (actualizada.estado !== "confirmada") return actualizada;
  const resultado = await peticionApi(`/compras/publicas/${actualizada.operacionBackend.id}/resultado`, { accesoCompra: compra.accesoCompra, signal });
  if (leerCompra()?.compraId !== compra.compraId) throw new DOMException("La compra cambió", "AbortError");
  if (!Array.isArray(resultado.tickets) || !resultado.tickets.length) throw new Error("No se pudieron consultar las entradas emitidas.");
  return { ...actualizada, total: resultado.total, tickets: resultado.tickets, cantidad: resultado.tickets.length,
    comprador: { nombre: resultado.comprador.nombre_comprador, apellido: "", rut: resultado.comprador.rut_comprador, correo: resultado.correo },
    metodo: resultado.medio_pago.toLowerCase(), correoEnviado: resultado.correo_enviado, orden: `TKI-${resultado.venta_id}`,
    codigo: resultado.tickets.map(t => t.cod_qr).join(" · ") };
}

export async function prepararCompra(compra, datos, metodo, cuotas) {
  const evento = await cargarEventoDisponible(compra.eventoId);
  const sector = evento.sectores.find(s => String(s.id) === String(compra.sectorId));
  if (!Number.isInteger(compra.cantidad) || compra.cantidad < 1 || compra.cantidad > 6
      || !evento.ventaHabilitada || !sector || sector.disponibles < compra.cantidad)
    throw new Error("Ya no hay disponibilidad para esta selección. Vuelve a elegir tus entradas.");
  if (sector.precio !== compra.precio)
    throw new Error("El precio cambió. Vuelve a elegir tus entradas para revisar el nuevo total.");
  const clave = crypto.randomUUID();
  const comprador = limpiarComprador(datos);
  const nombre = `${comprador.nombre} ${comprador.apellido}`;
  if (nombre.length > 50) throw new Error("El nombre del titular supera los 50 caracteres permitidos.");
  const [cuerpoRut, digito] = datos.rut.trim().replaceAll(".", "").toUpperCase().split("-");
  const rut = `${cuerpoRut.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${digito}`;
  const accesoCompra = Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, "0")).join("");
  return { ...compra, comprador, metodo, cuotas, accesoCompra, cuentaCompra: obtenerUsuario()?.authId || null,
    estado: "procesando", solicitudBackend: {
      clave, evento: Number(compra.eventoId), sector: Number(compra.sectorId), cantidad: compra.cantidad,
      nombre, rut, correo: comprador.correo, medio: metodo.toUpperCase(), codigo: compra.codigoDescuento || null,
    } };
}

export async function procesarCompra(compra, informar, signal) {
  if (!compra.accesoCompra) throw new Error("Esta selección corresponde al flujo anterior. Vuelve a elegir tus entradas.");
  const api = (ruta, opciones = {}) => {
    signal?.throwIfAborted();
    if (leerCompra()?.compraId !== compra.compraId) throw new DOMException("La compra venció o cambió", "AbortError");
    return peticionApi(`/compras/publicas${ruta}`, { ...opciones, accesoCompra: compra.accesoCompra, signal });
  };
  let token;
  if (!compra.operacionBackend && compra.cuentaCompra) {
    const sesion = leerSesion();
    if (sesion.usuario.authId !== compra.cuentaCompra) throw new Error("La cuenta de esta compra cambió.");
    token = sesion.token;
  }
  let operacion = compra.operacionBackend
    ? await api(`/${compra.operacionBackend.id}`)
    : await api("", { method: "POST", body: compra.solicitudBackend, token });
  const estados = { RESERVANDO: "Reservando tus entradas…", PENDIENTE_PAGO: "Confirmando el pago simulado…",
    CONFIRMANDO_PAGO: "Confirmando la reserva…", EMITIENDO: "Generando tus entradas…",
    CANCELANDO: "Cancelando la compra…", REEMBOLSANDO: "Revirtiendo el pago simulado…" };
  for (let intento = 0; intento < 45; intento++) {
    signal?.throwIfAborted();
    informar({ ...compra, operacionBackend: operacion }, estados[operacion.estado] || "Consultando compra…");
    if (operacion.estado === "COMPLETADA") {
      const resultado = await api(`/${operacion.id}/resultado`);
      const tickets = resultado.tickets;
      if (!Array.isArray(tickets) || tickets.length !== compra.cantidad)
        throw new Error("La compra está registrada, pero no se pudieron consultar todas las entradas. Reintenta consultar.");
      signal?.throwIfAborted();
      return { ...compra, operacionBackend: operacion, estado: "confirmada", total: resultado.total,
        correoEnviado: resultado.correo_enviado,
        orden: `TKI-${resultado.venta_id}`, codigo: tickets.map(t => t.cod_qr).join(" · "), tickets };
    }
    if (["CANCELADA", "REEMBOLSADA", "RESERVA_VENCIDA"].includes(operacion.estado)) {
      return { ...compra, operacionBackend: operacion, estado: "rechazada",
        motivo: operacion.mensaje || "La compra no pudo completarse. Selecciona nuevamente tus entradas." };
    }
    if (operacion.estado === "REVISION_REQUERIDA")
      throw new Error("La compra requiere revisión del administrador. No vuelvas a crearla.");
    if (operacion.estado === "PENDIENTE_PAGO" && operacion.reserva_estado === "RESERVADA") {
      operacion = await api(`/${operacion.id}/confirmar-simulado`, { method: "POST" });
      if (operacion.estado !== "PENDIENTE_PAGO") continue;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    operacion = await api(`/${operacion.id}`);
  }
  throw new Error("Tu compra sigue pendiente. Pulsa Consultar compra para revisar su estado sin duplicarla.");
}
