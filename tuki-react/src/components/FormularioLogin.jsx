import { useState } from "react";
import { validarLogin } from "../utils/validarLogin";
import "./FormularioLogin.css";

function FormularioLogin({ onValidado }) {
  const [datos, setDatos] = useState({ correo: "", password: "" });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");

  function cambiarCampo(event) {
    const { name, value } = event.target;
    setDatos({ ...datos, [name]: value });
    setErrores({ ...errores, [name]: "" });
    setMensaje("");
  }

  function comprobarLogin(event) {
    event.preventDefault();
    const nuevosErrores = validarLogin(datos);
    setErrores(nuevosErrores);
    const primerError = Object.keys(nuevosErrores)[0];
    if (primerError) {
      setMensaje("Revisa los campos marcados.");
      event.currentTarget.elements.namedItem(primerError).focus();
    } else {
      onValidado();
      setMensaje(
        "Los campos cumplen las validaciones. No se comprobaron las credenciales ni se inició sesión.",
      );
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
          <div className="login_campo">
            <label htmlFor="login_correo">Correo electrónico</label>
            <input
              id="login_correo"
              name="correo"
              type="email"
              placeholder="tu@ejemplo.com"
              maxLength={100}
              value={datos.correo}
              onChange={cambiarCampo}
              required
              className={errores.correo ? "input_error" : ""}
              aria-invalid={Boolean(errores.correo)}
              aria-describedby={
                errores.correo ? "login_error_correo" : undefined
              }
            />
            {errores.correo && (
              <p id="login_error_correo" className="txt_error">
                {errores.correo}
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
              maxLength={10}
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
          <button type="submit">Iniciar sesión</button>
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
      <div className="login_imagen">
        <img
          src="https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y29uY2llcnRvfGVufDB8fDB8fHww"
          alt=""
          loading="lazy"
        />
      </div>
    </section>
  );
}

export default FormularioLogin;
