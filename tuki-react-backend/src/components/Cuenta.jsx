import { navegar } from "../utils/navegacion";
import Perfil from "./Perfil";
import MisEntradas from "./MisEntradas";
import "./Cuenta.css";

function Cuenta({ usuario, entradas, seccion = "datos", onCerrarSesion, onActualizarUsuario }) {
  {
    /*parte en los datos y cambia segun el botons*/
  }

  const iniciales = (
    usuario.nombre.charAt(0) + usuario.apellido.charAt(0)
  ).toUpperCase();

  return (
    <section className="cuenta" aria-label="Mi cuenta">
      <header className="cuenta_perfil">
        <span className="cuenta_avatar" aria-hidden="true">
          {iniciales}
        </span>
        <div>
          <h2 className="cuenta_nombre">
            {usuario.nombre} {usuario.apellido}
          </h2>
          <p className="cuenta_datos">
            {usuario.correo} · Miembro desde {usuario.miembroDesde}
          </p>
        </div>
      </header>
      <nav className="cuenta_secciones" aria-label="Secciones de mi cuenta">
        {/*cambia el estado*/}
        <button
          type="button"
          className={`cuenta_seccion ${seccion === "datos" ? "is-activo" : ""}`}
          aria-pressed={seccion === "datos"}
          onClick={() => navegar("/cuenta/datos")}
        >
          Datos personales
        </button>
        <button
          type="button"
          className={`cuenta_seccion ${seccion === "entradas" ? "is-activo" : ""}`}
          aria-pressed={seccion === "entradas"}
          onClick={() => navegar("/cuenta/entradas")}
        >
          Mis entradas
        </button>
        <button
          type="button"
          className="cuenta_seccion cuenta_seccion_salir"
          onClick={onCerrarSesion}
        >
          Cerrar sesión
        </button>
      </nav>
      {seccion === "datos" ? (
        <Perfil usuario={usuario} onActualizarUsuario={onActualizarUsuario} />
      ) : (
        <MisEntradas entradas={entradas} />
      )}
    </section>
  );
}

export default Cuenta;
