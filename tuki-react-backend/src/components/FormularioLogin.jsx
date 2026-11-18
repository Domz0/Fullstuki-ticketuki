import ImagenAcceso from "./ImagenAcceso";
import { useState } from "react";
import { validarLogin } from "../utils/validarLogin";
import "./FormularioLogin.css";

function FormularioLogin({ onValidado, registroExitoso = false, contrasenaActualizada = false }) {
  const [datos, setDatos] = useState({ username: "", password: "" });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  function cambiarCampo(event) {
    const { name, value } = event.target;
    setDatos({ ...datos, [name]: value });
    setErrores({ ...errores, [name]: "" });
    setMensaje("");
  }

  async function comprobarLogin(event) {
    event.preventDefault();
    if (enviando) return;
    const nuevosErrores = validarLogin(datos);
    setErrores(nuevosErrores);
    const primerError = Object.keys(nuevosErrores)[0];
    if (primerError) {
      setMensaje("Revisa los campos marcados.");
      event.currentTarget.elements.namedItem(primerError).focus();
    } else {
      setEnviando(true);
      try {
        const resultado = await onValidado(datos);
        if (resultado?.error) {
          setErrores({ password: resultado.error });
          setMensaje(resultado.error);
        }
      } finally {
        setEnviando(false);
      }
    }
  }

  return (
    <section className="login" aria-labelledby="titulo_login">
      <div className="login_contenido">
        <a href="#/inicio" className="login_marca">
          Ticketuki
        </a>
        <form
          className="login_formulario"
          onSubmit={comprobarLogin}
          noValidate
          autoComplete="off"
        >
          <h2 id="titulo_login">Ingresar a tu cuenta</h2>
          {contrasenaActualizada && <p className="txt_exito" role="status">Contraseña actualizada. Inicia sesión con tu nueva contraseña.</p>}
          {registroExitoso && <p className="txt_exito" role="status">Cuenta creada. Ya puedes iniciar sesión.</p>}
          <div className="login_campo">
            <label htmlFor="login_username">Nombre de usuario o correo</label>
            <input
              id="login_username"
              name="username"
              type="text"
              placeholder="Tu usuario o correo"
              maxLength={100}
              value={datos.username}
              onChange={cambiarCampo}
              required
              className={errores.username ? "input_error" : ""}
              aria-invalid={Boolean(errores.username)}
              aria-describedby={
                errores.username ? "login_error_username" : undefined
              }
            />
            {errores.username && (
              <p id="login_error_username" className="txt_error">
                {errores.username}
              </p>
            )}
          </div>
          <div className="login_campo">
            <label htmlFor="login_password">Contraseña</label>
            <input
              id="login_password"
              name="password"
              type="password"
              placeholder="Contraseña"
              maxLength={100}
              value={datos.password}
              onChange={cambiarCampo}
              required
              className={errores.password ? "input_error" : ""}
              aria-invalid={Boolean(errores.password)}
              aria-describedby={
                errores.password ? "login_error_password" : undefined
              }
            />
            {errores.password && (
              <p id="login_error_password" className="txt_error">
                {errores.password}
              </p>
            )}
          </div>
          <button type="submit" disabled={enviando}>{enviando ? "Ingresando..." : "Iniciar sesión"}</button>
          <p
            role="status"
            className={
              Object.values(errores).some(Boolean) ? "txt_error" : "txt_exito"
            }
          >
            {mensaje}
          </p>
          <p className="login_crear">
            ¿No tienes cuenta? <a href="#/registro">Crear cuenta</a>
          </p>
        </form>
      </div>
      <ImagenAcceso className="login_imagen" />
    </section>
  );
}

export default FormularioLogin;
