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

  const { subtotal, cargo, iva, total } = calcularTotales(seleccion.precio, cantidad);

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
        {seleccion.disponibles != null && <p className="seleccion_disponibilidad" role="status">
          {seleccion.disponibles} {seleccion.disponibles === 1 ? "entrada disponible" : "entradas disponibles"}
          {seleccion.capacidad != null && <span> · Capacidad del sector: {seleccion.capacidad}</span>}
        </p>}
      </div>
      <CantidadEntradas cantidad={cantidad} onCambiar={onCambiarCantidad} disponibles={seleccion.disponibles} />
      <dl className="totales" aria-live="polite">
        <div className="totales_fila">
          <dt>{cantidad} × entrada</dt>
          <dd>{pesos(subtotal)}</dd>
        </div>
        <div className="totales_fila">
          <dt>IVA (19%)</dt>
          <dd>{pesos(iva)}</dd>
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
        disabled={seleccion.disponibles != null && cantidad > seleccion.disponibles}
      >
        Continuar al pago
      </button>
    </section>
  );
}

export default SeleccionEntradas;
