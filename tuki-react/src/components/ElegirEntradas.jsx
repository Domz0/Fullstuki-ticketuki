import { useState } from 'react'
import PasosCompra from './PasosCompra'
import SeleccionEntradas from './SeleccionEntradas'
import './ElegirEntradas.css'

function ElegirEntradas({ evento, seleccion }) {
  const [areaElegida, setAreaElegida] = useState(false)
  const fecha = evento.fechas[0]

  return (
    <section className="elegir_entradas" aria-labelledby="elegir_entradas_titulo">
      <PasosCompra etapa="entradas" />
      <header className="cabeza">
        <h2 id="elegir_entradas_titulo" className="cabeza_titulo">{evento.nombre}</h2>
        <p className="cabeza_detalle">{fecha.dia} {fecha.mes} · {fecha.horario} · {evento.recinto}</p>
      </header>
      <div className="entradas_columnas">
        <section className="plano" aria-label="Selección del recinto pendiente">
          <div className="plano_pendiente">
            <button className="boton plano_simular" type="button" aria-pressed={areaElegida} onClick={() => setAreaElegida(!areaElegida)}>falta agregar</button>
          </div>
          <p className="plano_nota">Selección por área. La ubicación exacta dentro del área se asigna al ingresar al recinto.</p>
        </section>
        <SeleccionEntradas key={areaElegida ? 'elegida' : 'vacia'} seleccion={areaElegida ? seleccion : null} />
      </div>
    </section>
  )
}

export default ElegirEntradas
