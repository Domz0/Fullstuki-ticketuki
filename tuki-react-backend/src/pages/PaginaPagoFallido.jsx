import PasosCompra from "../components/comunes/PasosCompra";
import PagoFallido from "../components/compras/PagoFallido";
import { calcularTotales, leerCompra } from "../utils/compra";
import { navegar } from "../utils/navegacion";

const metodosPago = {
  debito: "Débito",
  credito: "Crédito",
  transferencia: "Transferencia bancaria",
};

function PaginaPagoFallido({ evento, fecha }) {
  const compra = leerCompra();
  const parametros = "?fecha=" + encodeURIComponent(fecha.id);
  const mismoEvento = String(compra?.eventoId) === String(evento.id);
  const mismaFecha = compra?.fechaId === fecha.id;
  const compraRechazada = compra?.estado === "rechazada";

  if (!compraRechazada || !mismoEvento || !mismaFecha) {
    return (
      <section>
        <h2>No hay un pago rechazado para esta función</h2>
        <a href={"#/entradas/" + evento.id + parametros}>Elegir entradas</a>
      </section>
    );
  }

  // muestra el resumen del fallo
  const totales = calcularTotales(compra.precio, compra.cantidad, compra.porcentajeDescuento);
  const requiereNuevaSeleccion = Boolean(compra.solicitudBackend);
  const datosCompra = {
    ...compra,
    total: totales.total,
    evento: evento.nombre,
    recinto: evento.recinto,
    metodoPago: metodosPago[compra.metodo] || "Sin especificar",
  };

  function reintentar() {
    // consulta cupos nuevamente
    let destino = "pago";
    if (requiereNuevaSeleccion) {
      destino = "entradas";
    }

    navegar("/" + destino + "/" + evento.id + parametros);
  }

  return (
    <>
      <PasosCompra etapa="pago" />
      <PagoFallido
        compra={datosCompra}
        requiereNuevaSeleccion={requiereNuevaSeleccion}
        onReintentar={reintentar}
      />
    </>
  );
}

export default PaginaPagoFallido;
