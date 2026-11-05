import { navegar } from "../utils/navegacion";
import "./DetalleEvento.css";

function DetalleEvento({ evento }) {
  function pesos(valor) {
    return "$" + valor.toLocaleString("es-CL");
  }

  return (
    <section className="detalle_evento" aria-labelledby="detalle_evento_titulo">
      <section className="trailer" aria-label="Tráiler del evento">
        <a
          className="trailer_volver"
          href={`#/catalogo/${evento.categoriaId || "musica"}`}
          aria-label="Volver al listado"
        >
          <span aria-hidden="true">←</span>
        </a>
        {evento.trailer ? (
          <iframe
            className="trailer_video"
            src={evento.trailer}
            id="trailer_evento"
            title={`Tráiler de ${evento.nombre}`}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="encrypted-media; picture-in-picture; fullscreen"
          ></iframe>
        ) : (
          <p className="texto_secundario">Tráiler por agregar</p>
        )}
      </section>
      <div className="evento_columnas">
        <div className="evento_principal">
          <p className="etiquetas">
            <span className="etiqueta">{evento.categoria}</span>
            <span className="etiqueta">{evento.subcategoria}</span>
          </p>
          <h2 id="detalle_evento_titulo" className="evento_titulo">
            {evento.nombre}
          </h2>
          <p className="evento_bajada">{evento.descripcion}</p>
          <dl className="fichas">
            <div className="ficha">
              <dt className="ficha_rotulo">Recinto</dt>
              <dd className="ficha_dato">{evento.ubicacion}</dd>
            </div>
            <div className="ficha">
              <dt className="ficha_rotulo">Duración</dt>
              <dd className="ficha_dato">{evento.duracion}</dd>
            </div>
            <div className="ficha">
              <dt className="ficha_rotulo">Edad</dt>
              <dd className="ficha_dato">{evento.edad}</dd>
            </div>
          </dl>
          <section className="fechas" aria-label="Fechas disponibles">
            <h3 className="evento_subtitulo">Fechas disponibles</h3>
            <ul className="fechas_lista">
              {evento.fechas.map((fecha) => (
                <li
                  key={fecha.id}
                  className={`fecha ${fecha.estado === "Agotado" ? "fecha_agotada" : ""}`}
                >
                  <p className="fecha_dia">
                    <strong className="fecha_numero">{fecha.dia}</strong>
                    <span className="fecha_mes">{fecha.mes}</span>
                  </p>
                  <div className="fecha_texto">
                    <p className="fecha_horario">{fecha.horario}</p>
                    <p className="fecha_recinto">{evento.recinto}</p>
                  </div>
                  <p className="fecha_estado">{fecha.estado}</p>
                  <button
                    type="button"
                    onClick={() =>
                      navegar(`/entradas/${evento.id}?fecha=${fecha.id}`)
                    }
                    disabled={fecha.estado === "Agotado"}
                    className={`boton fecha_accion ${fecha.estado === "Agotado" ? "fecha_accion_inactiva" : "boton_morado"}`}
                  >
                    {fecha.estado === "Agotado" ? "Agotado" : "Elegir área"}
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section className="recinto" aria-label="Recinto">
            <h3 className="evento_subtitulo">Recinto</h3>
            <div className="recinto_tarjeta">
              <div className="recinto_pendiente">
                <button
                  type="button"
                  onClick={() => navegar(`/entradas/${evento.id}`)}
                  className="boton boton_morado"
                >
                  falta agregar
                </button>
              </div>
              <p className="recinto_pie">{evento.ubicacion}</p>
            </div>
          </section>
        </div>
        <aside className="reserva" aria-label="Compra de entradas">
          <p className="reserva_rotulo">Entradas desde</p>
          <p className="reserva_precio">{pesos(evento.precio)}</p>
          <p className="reserva_nota">
            Precio final por entrada: {pesos(evento.precioConCargo)} con cargo
          </p>
          <div className="reserva_botones">
            <button
              type="button"
              onClick={() => navegar(`/entradas/${evento.id}`)}
              className="boton boton_morado reserva_comprar"
            >
              Elegir entradas
            </button>
          </div>
          <ul className="reserva_lista">
            {evento.condiciones.map((condicion) => (
              <li key={condicion}>{condicion}</li>
            ))}
          </ul>
          <p className="reserva_convenios">{evento.convenios}</p>
        </aside>
      </div>
      <div className="compra">
        <p className="compra_precio">
          <span className="compra_desde">Desde</span>
          <strong className="compra_monto">{pesos(evento.precio)}</strong>
        </p>
        <button
          type="button"
          onClick={() => navegar(`/entradas/${evento.id}`)}
          className="boton boton_morado compra_accion"
        >
          Elegir entradas
        </button>
      </div>
    </section>
  );
}

export default DetalleEvento;
