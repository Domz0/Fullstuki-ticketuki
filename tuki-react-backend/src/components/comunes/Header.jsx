import BuscadorEventos from "../eventos/BuscadorEventos";
import { categorias } from "../../utils/eventos";

import "./Header.css";

function Header({ categoria, usuario, onCerrarSesion }) {
  const esAdministrador = usuario?.rol === "admin";
  const rutaCuenta = esAdministrador ? "#/admin/dashboard" : "#/cuenta/datos";
  const textoCuenta = esAdministrador ? "Administración" : "Mi cuenta";
  let iniciales = "";
  if (usuario) {
    iniciales = (usuario.nombre.charAt(0) + usuario.apellido.charAt(0)).toUpperCase();
  }

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
                href={rutaCuenta}
                aria-label={`Mi cuenta: ${usuario.nombre} ${usuario.apellido}`}
              >
                <span className="menu_avatar" aria-hidden="true">
                  {iniciales}
                </span>
                <span className="menu_cuenta-texto">{textoCuenta}</span>
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
          {Object.entries(categorias).map(([id, nombre]) => (
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
