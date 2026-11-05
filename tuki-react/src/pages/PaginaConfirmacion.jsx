import PasosCompra from "../components/PasosCompra";
import Confirmacion from "../components/Confirmacion";
import { compra } from "../data/compra";

function PaginaConfirmacion({ evento, fecha, seleccion, cantidad, metodo }) {
  const metodos = {
    debito: "Débito",
    credito: "Crédito",
    transferencia: "Transferencia bancaria",
  };
  const datosCompra = {
    ...compra,
    evento: evento.nombre,
    recinto: evento.recinto,
    fecha: `${fecha.dia} ${fecha.mes} · ${fecha.horario}`,
    cantidad,
    area: seleccion.area,
    total: Math.round(seleccion.precio * cantidad * 1.1),
    metodoPago: metodos[metodo] || "Débito",
  };

  return (
    <>
      <PasosCompra etapa="confirmacion" />
      <Confirmacion compra={datosCompra} />
    </>
  );
}

export default PaginaConfirmacion;
