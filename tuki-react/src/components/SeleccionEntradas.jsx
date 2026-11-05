import { useState } from 'react'
import CantidadEntradas from './CantidadEntradas'
import './SeleccionEntradas.css'

function SeleccionEntradas({ seleccion }) {
  const [cantidad, setCantidad] = useState(1)
  const subtotal = seleccion.precio * cantidad
  const cargo = Math.round(subtotal * seleccion.tasaServicio)
  const total = subtotal + cargo

  function pesos(valor) {
    return '$' + valor.toLocaleString('es-CL')
  }

  return (
    <section className="seleccion" aria-label="Tu selección">
      <h2 className="seleccion_titulo">Tu selección</h2>
      <div className="seleccion_area">
        <p className="seleccion_nombre">{seleccion.area}</p>
        <p className="seleccion_unidad">{pesos(seleccion.precio)} por entrada</p>
      </div>
      <CantidadEntradas cantidad={cantidad} onCambiar={setCantidad} />
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
      <button type="button" className="boton seleccion_continuar">Continuar al pago</button>
    </section>
  )
}

export default SeleccionEntradas
