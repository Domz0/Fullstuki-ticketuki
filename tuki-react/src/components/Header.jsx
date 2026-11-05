import './Header.css'

function Header({ categoria, onCategoria }) {
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
        <a href="#catalogo" className={`categorias_chip ${categoria === 'musica' ? 'is-activo' : ''}`} onClick={() => onCategoria?.('musica')}>Música</a>
        <a href="#catalogo" className={`categorias_chip ${categoria === 'artes' ? 'is-activo' : ''}`} onClick={() => onCategoria?.('artes')}>Artes y Teatro</a>
        <a href="#catalogo" className={`categorias_chip ${categoria === 'deportes' ? 'is-activo' : ''}`} onClick={() => onCategoria?.('deportes')}>Deportes</a>
        <a href="#catalogo" className={`categorias_chip ${categoria === 'ferias' ? 'is-activo' : ''}`} onClick={() => onCategoria?.('ferias')}>Ferias &amp; Expos</a>
      </nav>
    </header>
  )
}

export default Header
