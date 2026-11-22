import { navegar } from "../../utils/navegacion";
import Perfil from "./Perfil";
import MisEntradas from "./MisEntradas";
import HistorialCuenta from "./HistorialCuenta";
import { inicialesUsuario, nombreVisible } from "../../utils/sesion";
import "./Cuenta.css";

function Cuenta({ usuario, seccion = "datos", onCerrarSesion, onActualizarUsuario }) {

  const iniciales = inicialesUsuario(usuario);

  // la seccion de la ruta determina que datos se muestran
  function mostrarSeccion() {
    if (seccion === "datos") {
      return <Perfil usuario={usuario} onActualizarUsuario={onActualizarUsuario} />;
    }
    if (seccion === "historial") {
      return <HistorialCuenta key={usuario.usuarioId} usuario={usuario} />;
    }
    return <MisEntradas key={usuario.usuarioId} usuario={usuario} />;
  }

  return (
    <section className="cuenta" aria-label="Mi cuenta">
      <header className="cuenta_perfil">
        <span className="cuenta_avatar" aria-hidden="true">
          {iniciales}
        </span>
        <div>
          <h2 className="cuenta_nombre">
            {nombreVisible(usuario)}
          </h2>
          <p className="cuenta_datos">
            {usuario.correo || usuario.username}
          </p>
        </div>
      </header>
      <nav className="cuenta_secciones" aria-label="Secciones de mi cuenta">
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
          className={`cuenta_seccion ${seccion === "historial" ? "is-activo" : ""}`}
          aria-pressed={seccion === "historial"}
          onClick={() => navegar("/cuenta/historial")}
        >
          Historial
        </button>
        <button
          type="button"
          className="cuenta_seccion cuenta_seccion_salir"
          onClick={onCerrarSesion}
        >
          Cerrar sesión
        </button>
      </nav>
      {mostrarSeccion()}
    </section>
  );
}

export default Cuenta;
