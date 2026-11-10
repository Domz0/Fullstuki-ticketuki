import { calcularTotales } from "../utils/compra";
import CantidadEntradas from "./CantidadEntradas";
import "./SeleccionEntradas.css";

function SeleccionEntradas({ seleccion, cantidad, onCambiarCantidad, onContinuar, children }) {
  if (!seleccion) {
    return (
      <section className="seleccion" aria-label="Tu selección">
        <h2 className="seleccion_titulo">Tu selección</h2>
        <p className="seleccion_vacio">
          Elige un área para ver precios y continuar.
        </p>
        {children}
      </section>
    );
  }

  const { subtotal, cargo, total } = calcularTotales(seleccion.precio, cantidad);

  function pesos(valor) {
    return "$" + valor.toLocaleString("es-CL");
  }

  return (
    <section className="seleccion" aria-label="Tu selección">
      <h2 className="seleccion_titulo">Tu selección</h2>
      <div className="seleccion_area">
        <p className="seleccion_nombre">{seleccion.area}</p>
        <p className="seleccion_unidad">
          {pesos(seleccion.precio)} por entrada
        </p>
      </div>
      <CantidadEntradas cantidad={cantidad} onCambiar={onCambiarCantidad} />
      <dl className="totales" aria-live="polite">
        <div className="totales_fila">
          <dt>{cantidad} × entrada</dt>
          <dd>{pesos(subtotal)}</dd>
        </div>
        <div className="totales_fila">
          <dt>Cargo por servicio</dt>
          <dd>{pesos(cargo)}</dd>
        </div>
        <div className="totales_fila totales_fila_total">
          <dt>Total</dt>
          <dd>{pesos(total)}</dd>
        </div>
      </dl>
      <button
        type="button"
        className="boton seleccion_continuar"
        onClick={onContinuar}
      >
        Continuar al pago
      </button>
    </section>
  );
}

export default SeleccionEntradas;
