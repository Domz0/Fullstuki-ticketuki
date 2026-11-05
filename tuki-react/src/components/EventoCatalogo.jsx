function EventoCatalogo({ evento }) {
  return (
    <article className="resultado">
      <div className="resultado_imagen"><span className="resultado_placeholder">Imagen</span></div>
      <div className="resultado_cuerpo">
        <h3 className="resultado_nombre">{evento.nombre}</h3>
        <p className="resultado_dato">{evento.detalle}</p>
        <div className="resultado_etiquetas">
          <span className="resultado_etiqueta">{evento.subcategoria}</span>
          <span className={`resultado_etiqueta ${evento.estado === 'Agotado' ? 'resultado_etiqueta_agotado' : 'resultado_etiqueta_estado'}`}>{evento.estado}</span>
        </div>
      </div>
      <div className="resultado_compra">
        <span className="resultado_desde">Desde</span>
        <strong className="resultado_precio">${evento.precio.toLocaleString('es-CL')}</strong>
        <button className="resultado_ver" type="button">Ver entradas <span aria-hidden="true">→</span></button>
      </div>
    </article>
  )
}

export default EventoCatalogo
