import { useState } from "react";
import FiltrosEventos from "./FiltrosEventos";
import EventoCatalogo from "./EventoCatalogo";
import { filtrarCatalogo } from "../utils/filtrarCatalogo";
import "./CatalogoEventos.css";

const nombres = {
  musica: "Música",
  artes: "Artes y Teatro",
  deportes: "Deportes",
  ferias: "Ferias & Expos",
};
const filtrosVacios = { subcategoria: "", ciudad: "", plazo: "", recinto: "" };

function CatalogoEventos({
  eventos,
  categoria = "musica",
  busquedaInicial = "",
}) {
  const [filtros, setFiltros] = useState(filtrosVacios);
  const [busqueda, setBusqueda] = useState(busquedaInicial);
  const [orden, setOrden] = useState("fecha");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const deCategoria = eventos.filter(
    (evento) => evento.categoria === categoria,
  );
  const visibles = filtrarCatalogo(deCategoria, filtros, busqueda, orden);

  function cambiarFiltro(grupo, valor) {
    setFiltros({ ...filtros, [grupo]: filtros[grupo] === valor ? "" : valor });
  }

  function limpiar() {
    setFiltros(filtrosVacios);
    setBusqueda("");
  }

  return (
    <section
      id="catalogo"
      className={`catalogo ${mostrarFiltros ? "catalogo_filtros_abiertos" : ""}`}
      aria-labelledby="titulo_catalogo"
    >
      <h2 id="titulo_catalogo" className="categoria_titulo">
        {nombres[categoria]}
      </h2>
      <div className="busqueda" role="search">
        <span className="busqueda_lupa" aria-hidden="true"></span>
        <input
          className="busqueda_campo"
          type="search"
          aria-label="Buscar en esta categoría"
          placeholder="Buscar en esta categoría"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
        />
      </div>
      <button
        type="button"
        className="catalogo_abrir"
        aria-expanded={mostrarFiltros}
        aria-controls="catalogo_panel"
        onClick={() => setMostrarFiltros(!mostrarFiltros)}
      >
        {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
      </button>
      <div className="listado">
        <div id="catalogo_panel">
          <FiltrosEventos
            eventos={deCategoria}
            filtros={filtros}
            onCambiar={cambiarFiltro}
            onLimpiar={limpiar}
          />
        </div>
        <div className="listado_columna">
          <div className="resultados_barra">
            <p className="resultados_conteo" role="status">
              {visibles.length} {visibles.length === 1 ? "evento" : "eventos"}{" "}
              en {nombres[categoria]}
            </p>
            <label className="orden">
              <span className="orden_texto">Ordenar por</span>
              <select
                className="selector"
                aria-label="Ordenar por"
                value={orden}
                onChange={(event) => setOrden(event.target.value)}
              >
                <option value="fecha">Fecha más próxima</option>
                <option value="precio">Precio</option>
              </select>
            </label>
          </div>
          <div className="resultados">
            {visibles.map((evento) => (
              <EventoCatalogo key={evento.id} evento={evento} />
            ))}
            {visibles.length === 0 && (
              <p className="resultados_vacio">
                No hay eventos que coincidan con los filtros.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CatalogoEventos;
