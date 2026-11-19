import BuscadorEventos from "./BuscadorEventos";

import "./Header.css";

function Header({ categoria, usuario, onCerrarSesion }) {
  return (
    <header className="header">
      <div className="header_barra">
        <a className="header_marca" href="#/inicio">
          Ticketuki
        </a>
        <BuscadorEventos />
        <nav className="menu" aria-label="Acceso">
          {usuario ? (
            <>
              <button
                type="button"
                className="menu_enlace menu_salir"
                onClick={onCerrarSesion}
              >
                Cerrar sesión
              </button>
              <a
                className="menu_cuenta"
                href={usuario.rol === "admin" ? "#/admin/dashboard" : "#/cuenta/datos"}
                aria-label={`Mi cuenta: ${usuario.nombre} ${usuario.apellido}`}
              >
                <span className="menu_avatar" aria-hidden="true">
                  {(
                    usuario.nombre.charAt(0) + usuario.apellido.charAt(0)
                  ).toUpperCase()}
                </span>
                <span className="menu_cuenta-texto">{usuario.rol === "admin" ? "Administración" : "Mi cuenta"}</span>
              </a>
            </>
          ) : (
            <>
              <a className="menu_enlace" href="#/registro">
                Crear cuenta
              </a>
              <a className="menu_enlace" href="#/login">
                Iniciar sesión
              </a>
            </>
          )}
        </nav>
      </div>
      <div className="header_navegacion">
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
      {usuario?.rol === "cliente" && <a className="menu_transferir" href="#/transferir">Transferir entradas</a>}
      </div>
    </header>
  );
}
export default Header;
