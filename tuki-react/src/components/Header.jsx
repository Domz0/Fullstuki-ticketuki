import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header_barra">
        <a className="header_marca">Ticketuki</a>

        <div className="buscador" role="search">
          <span className="buscador_lupa" aria-hidden="true"></span>
          <label htmlFor="buscador-campo" hidden>Buscar</label>
          <input
            className="buscador_campo"
            id="buscador-campo"
            type="search"
            name="q"
            placeholder="Busca eventos, artistas, recintos o ciudades"
          />
        </div>

        <nav className="menu" aria-label="Acceso">
          <a className="menu_enlace">Crear cuenta</a>
          <a className="menu_enlace">Iniciar sesión</a>
        </nav>
      </div>

      <nav className="categorias" aria-label="Categorías">
        <a className="categorias_chip">Música</a>
        <a className="categorias_chip">Artes y Teatro</a>
        <a className="categorias_chip">Deportes</a>
        <a className="categorias_chip">Ferias &amp; Expos</a>
      </nav>
    </header>
  )
}

export default Header
