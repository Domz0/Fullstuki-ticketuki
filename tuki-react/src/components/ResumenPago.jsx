import { calcularTotales } from "../utils/compra";
import "./ResumenPago.css";

function ResumenPago({ evento, fecha, seleccion, cantidad, codigo = "" }) {
  const { subtotal, cargo, descuento, total } = calcularTotales(seleccion.precio, cantidad, codigo);
  function pesos(valor) {
    return "$" + valor.toLocaleString("es-CL");
  }

  return (
    <aside
      className="resumen_pago pago_bloque"
      aria-labelledby="resumen_pago_titulo"
    >
      <h2 id="resumen_pago_titulo">Resumen de compra</h2>
      <div className="resumen_evento">
        <div className="resumen_evento_texto">
          <b>{evento.nombre}</b>
          <p>
            {fecha.dia} {fecha.mes}{fecha.horario && ` · ${fecha.horario}`}
            <br />
            {evento.recinto}
          </p>
        </div>
      </div>
      <div className="separador"></div>
      <dl className="resumen_detalles">
        <div className="resumen_fila">
          <dt>Área</dt>
          <dd>{seleccion.area}</dd>
        </div>
        <div className="resumen_fila">
          <dt>{cantidad} × entrada</dt>
          <dd>{pesos(subtotal)}</dd>
        </div>
        <div className="resumen_fila">
          <dt>Cargo por servicio</dt>
          <dd>{pesos(cargo)}</dd>
        </div>
        <div className="resumen_fila">
          <dt>Descuento aplicado</dt>
          <dd>{descuento ? "-" + pesos(descuento) : pesos(0)}</dd>
        </div>
      </dl>
      <div className="separador"></div>
      <div className="resumen_fila resumen_total">
        <b>Total</b>
        <strong>{pesos(total)}</strong>
      </div>
      <button
        type="submit"
        form="formulario_pago"
        className="boton morado resumen_pago_continuar"
      >
        Continuar · {pesos(total)}
      </button>
      <p className="resumen_nota">
        Vista de ejemplo. Al continuar se validan los datos y se muestra la
        confirmación, sin realizar un cobro.
      </p>
    </aside>
  );
}

export default ResumenPago;
