import imagen from "../assets/portada.png";
import "./Portada.css";

function Portada({ evento }) {
  return (
    <section className="portada" aria-label="Evento destacado">
      <img
        className="portada_imagen"
        src={imagen}
        alt="Público en un concierto frente al escenario"
      />
      <div className="portada_velo" aria-hidden="true"></div>
      <div className="portada_texto">
        <p className="portada_etiqueta">Destacado · Música</p>
        <h1 className="portada_titulo">{evento.nombre}</h1>
        <p className="portada_datos">
          {evento.detalle}
          {evento.precio != null && ` · Desde $${evento.precio.toLocaleString("es-CL")}`}
        </p>
        <div className="portada_cta">
          <a className="boton portada_ver" href={`#/evento/${evento.id}`}>
            Ver evento
          </a>
        </div>
      </div>
    </section>
  );
}
export default Portada;
