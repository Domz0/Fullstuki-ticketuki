import './PasosCompra.css'

const pasos = [
  { id: 'entradas', nombre: 'Entradas' },
  { id: 'pago', nombre: 'Pago' },
  { id: 'confirmacion', nombre: 'Confirmación' },
]

function PasosCompra({ etapa = 'entradas' }) {
  let actual = 0
  pasos.forEach((paso, posicion) => {
    if (paso.id === etapa) actual = posicion
  })

  return (
    <nav className="pasos" aria-label="Progreso de la compra">
      <p className="pasos_resumen">Paso {actual + 1} de {pasos.length}</p>
      <ol className="pasos_lista">
        {pasos.map((paso, posicion) => (
          <li
            key={paso.id}
            className={`paso ${posicion < actual ? 'is-completo' : posicion === actual ? 'is-activo' : ''}`}
            aria-current={posicion === actual ? 'step' : undefined}
            aria-label={paso.nombre}
          >
            <span className="paso_numero" aria-hidden="true">
              {posicion < actual ? '✓' : posicion + 1}
            </span>
            <span className="paso_nombre">{paso.nombre}</span>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default PasosCompra
