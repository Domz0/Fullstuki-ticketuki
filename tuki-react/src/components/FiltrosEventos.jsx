function FiltrosEventos({ eventos, filtros, onCambiar, onLimpiar }) {
  const grupos = [
    { id: 'subcategoria', nombre: 'Subcategoría' },
    { id: 'ciudad', nombre: 'Ciudad' },
    { id: 'plazo', nombre: 'Fecha' },
    { id: 'recinto', nombre: 'Recinto' },
  ]

  function opcionesDe(grupo) {
    if (grupo === 'plazo') return [
      { valor: '1', nombre: 'Esta semana' },
      { valor: '2', nombre: 'Este mes' },
      { valor: '3', nombre: 'Próximos 3 meses' },
    ]
    const valores = []
    eventos.forEach((evento) => {
      if (!valores.includes(evento[grupo])) valores.push(evento[grupo])
    })
    return valores.sort((a, b) => a.localeCompare(b, 'es')).map((valor) => ({ valor, nombre: valor }))
  }

  return (
    <aside className="catalogo_filtros" aria-label="Filtros de eventos">
      <div className="panel_caja">
        <div className="panel_encabezado">
          <h3 className="panel_titulo">Filtros</h3>
          <button className="panel_limpiar" type="button" onClick={onLimpiar}>Limpiar todo</button>
        </div>
        {grupos.map((grupo) => (
          <div className="panel_grupo" key={grupo.id} role="group" aria-label={grupo.nombre}>
            <p className="panel_subtitulo">{grupo.nombre}</p>
            <div className="panel_opciones">
              {opcionesDe(grupo.id).map((opcion) => (
                <button key={opcion.valor} className={`panel_opcion ${filtros[grupo.id] === opcion.valor ? 'is-activo' : ''}`} type="button" aria-pressed={filtros[grupo.id] === opcion.valor} onClick={() => onCambiar(grupo.id, opcion.valor)}>{opcion.nombre}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

export default FiltrosEventos
