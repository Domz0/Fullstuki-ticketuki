import { actualizarDatosAcceso } from "../utils/sesion";
import { useState } from "react";
import { validarLogin as validarDatosAcceso } from "../utils/validarLogin";
import "./EditarDatosAcceso.css";

function EditarDatosAcceso({ usuario, onCancelar, onActualizarUsuario }) {
  const [datos, setDatos] = useState({ correo: usuario.correo, password: "" });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");

  function cambiarCampo(event) {
    const { name, value } = event.target;
    setDatos({ ...datos, [name]: value });
    setErrores({ ...errores, [name]: "" });
    setMensaje("");
  }

  function comprobarDatos(event) {
    event.preventDefault();
    const nuevosErrores = validarDatosAcceso(datos);
    setErrores(nuevosErrores);
    const primerError = Object.keys(nuevosErrores)[0];
    if (primerError) {
      setMensaje("Revisa los campos marcados.");
      event.currentTarget.elements.namedItem(primerError).focus();
    } else {
      try {
        const actualizado = actualizarDatosAcceso(datos);
        if (!actualizado) {
          setErrores({ correo: "Debes iniciar sesión para guardar cambios." });
          return;
        }
        onActualizarUsuario(actualizado);
        setDatos({ correo: actualizado.correo, password: "" });
        setMensaje("Datos de acceso guardados.");
      } catch {
        setErrores({ correo: "No se pudieron guardar los cambios." });
      }
    }
  }

  return (
    <form
      className="editar_acceso"
      onSubmit={comprobarDatos}
      noValidate
      autoComplete="off"
      aria-label="Editar datos de acceso"
    >
      <div className="editar_acceso_campo">
        <label htmlFor="perfil_nuevo_correo">Nuevo correo</label>
        <input
          id="perfil_nuevo_correo"
          name="correo"
          type="email"
          maxLength={100}
          value={datos.correo}
          onChange={cambiarCampo}
          required
          className={errores.correo ? "input_error" : ""}
          aria-invalid={Boolean(errores.correo)}
          aria-describedby={errores.correo ? "perfil_error_correo" : undefined}
        />
        {errores.correo && (
          <p id="perfil_error_correo" className="txt_error">
            {errores.correo}
          </p>
        )}
      </div>
      <div className="editar_acceso_campo">
        <label htmlFor="perfil_nueva_password">Nueva contraseña</label>
        <input
          id="perfil_nueva_password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Entre 4 y 10 caracteres"
          maxLength={10}
          value={datos.password}
          onChange={cambiarCampo}
          required
          className={errores.password ? "input_error" : ""}
          aria-invalid={Boolean(errores.password)}
          aria-describedby={
            errores.password ? "perfil_error_password" : undefined
          }
        />
        {errores.password && (
          <p id="perfil_error_password" className="txt_error">
            {errores.password}
          </p>
        )}
      </div>
      <div className="editar_acceso_botones">
        <button type="submit" className="editar_acceso_validar">
          Guardar cambios
        </button>
        <button
          type="button"
          className="editar_acceso_cancelar"
          onClick={onCancelar}
        >
          Cancelar
        </button>
      </div>
      <p
        role="status"
        className={
          Object.values(errores).some(Boolean) ? "txt_error" : "txt_exito"
        }
      >
        {mensaje}
      </p>
    </form>
  );
}

export default EditarDatosAcceso;
