import "./CantidadEntradas.css";

function CantidadEntradas({ cantidad, onCambiar }) {
  const maximo = 6;

  function cambiarCantidad(paso) {
    onCambiar(Math.max(1, Math.min(maximo, cantidad + paso)));
  }

  return (
    <div
      className="cantidad_entradas"
      role="group"
      aria-label="Cantidad de entradas"
    >
      <p className="cantidad_rotulo">Cantidad de entradas</p>
      <div className="cantidad">
        <button
          className="cantidad_boton"
          type="button"
          aria-label="Quitar una entrada"
          disabled={cantidad === 1}
          onClick={() => cambiarCantidad(-1)}
        >
          −
        </button>
        <output
          className="cantidad_valor"
          aria-label="Cantidad seleccionada"
          aria-live="polite"
        >
          {cantidad}
        </output>
        <button
          className="cantidad_boton"
          type="button"
          aria-label="Agregar una entrada"
          disabled={cantidad === maximo}
          onClick={() => cambiarCantidad(1)}
        >
          +
        </button>
        <span className="cantidad_tope">Máximo {maximo} por compra</span>
      </div>
    </div>
  );
}

export default CantidadEntradas;
