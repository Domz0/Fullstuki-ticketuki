import './Evento.css'

function Evento({ evento }) {
  return (
    <article className="tarjeta">
      <div className="tarjeta_imagen">
        {evento.imagen ? (
          <img className="tarjeta_foto" src={evento.imagen} alt={evento.nombre} />
        ) : (
          <span className="tarjeta_placeholder texto_small">Sin imagen</span>
        )}
      </div>
      <div className="tarjeta_cuerpo">
        <span className="tarjeta_tag">{evento.categoria}</span>
        <h3 className="tarjeta_nombre">{evento.nombre}</h3>
        <p className="tarjeta_dato texto_secundario">{evento.recinto}</p>
        <p className="tarjeta_dato texto_secundario">{evento.fecha}</p>
        <div className="tarjeta_pie flex_H">
          <strong className="tarjeta_precio">
            ${evento.precio.toLocaleString('es-CL')}
          </strong>
          {evento.enlace && (
            <a className="enlace tarjeta_ver" href={evento.enlace} aria-label={`Ver ${evento.nombre}`}>
              Ver <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default Evento

