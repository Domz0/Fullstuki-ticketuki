import "./PaginaNoEncontrada.css";

function PaginaNoEncontrada() {
  return (
    <section>
      <h1>Pantalla no encontrada</h1>
      <a className="no_encontrada_volver" href="#/inicio">
        <span aria-hidden="true">←</span> Volver al inicio
      </a>
    </section>
  );
}

export default PaginaNoEncontrada;
