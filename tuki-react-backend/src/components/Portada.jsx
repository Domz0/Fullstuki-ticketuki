import imagen from "../assets/portada.png";
import "./Portada.css";

function Portada() {
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
        <h1 className="portada_titulo">Lollapalooza 2026</h1>
        <p className="portada_datos">
          Estadio Nacional · Sáb 14 nov, 20:00 · Desde $35.000
        </p>
        <div className="portada_cta">
          <a className="boton portada_ver" href="#/evento/destacado">
            Ver evento
          </a>
          <a
            className="boton portada_trailer"
            href="https://www.youtube.com/watch?v=c1eojidXyUU"
            target="_blank"
            rel="noreferrer"
          >
            Ver tráiler
          </a>
        </div>
      </div>
    </section>
  );
}
export default Portada;
