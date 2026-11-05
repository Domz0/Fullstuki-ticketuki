import { useState } from "react";
import { navegar } from "../utils/navegacion";
import "./Header.css";

function Header({ categoria }) {
  const [busqueda, setBusqueda] = useState("");
  function buscar(event) {
    event.preventDefault();
    navegar(
      `/catalogo/${categoria || "musica"}?q=${encodeURIComponent(busqueda)}`,
    );
  }
  return (
    <header className="header">
      <div className="header_barra">
        <a className="header_marca" href="#/inicio">
          Ticketuki
        </a>
        <form className="buscador" role="search" onSubmit={buscar}>
          <span className="buscador_lupa" aria-hidden="true"></span>
          <label htmlFor="buscador-campo" hidden>
            Buscar eventos
          </label>
          <input
            className="buscador_campo"
            id="buscador-campo"
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Busca eventos, artistas, recintos o ciudades"
          />
          <button type="submit" className="header_buscar">
            Buscar
          </button>
        </form>
        <nav className="menu" aria-label="Acceso">
          <a className="menu_enlace" href="#/registro">
            Crear cuenta
          </a>
          <a className="menu_enlace" href="#/login">
            Iniciar sesión
          </a>
          <a className="menu_enlace" href="#/cuenta/datos">
            Mi cuenta
          </a>
        </nav>
      </div>
      <nav className="categorias" aria-label="Categorías">
        {[
          ["musica", "Música"],
          ["artes", "Artes y Teatro"],
          ["deportes", "Deportes"],
          ["ferias", "Ferias & Expos"],
        ].map(([id, nombre]) => (
          <a
            key={id}
            href={`#/catalogo/${id}`}
            className={`categorias_chip ${categoria === id ? "is-activo" : ""}`}
          >
            {nombre}
          </a>
        ))}
      </nav>
    </header>
  );
}
export default Header;
