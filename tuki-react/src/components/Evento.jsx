import "./Evento.css";

function Evento({ evento }) {
  return (
    <article className="tarjeta">
      <div className="tarjeta_imagen">
        {evento.imagen ? (
          <img
            className="tarjeta_foto"
            src={evento.imagen}
            alt={evento.nombre}
          />
        ) : (
          <span className="tarjeta_placeholder">Sin imagen</span>
        )}
      </div>
      <div className="tarjeta_cuerpo">
        <span className="tarjeta_tag">{evento.categoria}</span>
        <h3 className="tarjeta_nombre">{evento.nombre}</h3>
        <p className="tarjeta_dato">{evento.recinto}</p>
        <p className="tarjeta_dato">{evento.fecha}</p>
        <div className="tarjeta_pie">
          <strong className="tarjeta_precio">
            ${evento.precio.toLocaleString("es-CL")}
          </strong>
          {evento.enlace && (
            <a
              className="tarjeta_ver"
              href={evento.enlace}
              aria-label={`Ver ${evento.nombre}`}
            >
              Ver <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default Evento;
