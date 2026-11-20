import { cambiarContrasena } from "../../utils/sesion";
import { navegar } from "../../utils/navegacion";
import { useState } from "react";
import "./EditarDatosAcceso.css";

function EditarDatosAcceso({ onCancelar, onActualizarUsuario }) {
  const [datos, setDatos] = useState({ actual: "", nueva: "", confirmacion: "" });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiarCampo(event) {
    const { name, value } = event.target;
    setDatos({ ...datos, [name]: value });
    setErrores({ ...errores, [name]: "" });
    setMensaje("");
  }

  function validarContrasenas() {
    const nuevosErrores = {};
    if (!datos.actual.trim()) {
      nuevosErrores.actual = "Ingresa tu contraseña actual";
    }
    if (!datos.nueva.trim() || datos.nueva.length < 8 || datos.nueva.length > 100) {
      nuevosErrores.nueva = "Usa entre 8 y 100 caracteres";
    } else if (datos.nueva === datos.actual) {
      nuevosErrores.nueva = "La nueva contraseña debe ser distinta";
    }
    if (datos.confirmacion !== datos.nueva || !datos.confirmacion) {
      nuevosErrores.confirmacion = "Las contraseñas no coinciden";
    }
    return nuevosErrores;
  }

  async function guardar(event) {
    event.preventDefault();
    if (enviando) return;
    const nuevosErrores = validarContrasenas();
    setErrores(nuevosErrores);
    const primerError = Object.keys(nuevosErrores)[0];
    if (primerError) {
      event.currentTarget.elements.namedItem(primerError).focus();
      return;
    }
    setMensaje("");
    setEnviando(true);
    try {
      await cambiarContrasena(datos);
      onActualizarUsuario(null);
      navegar("/login?contrasena=ok");
    } catch (error) {
      setMensaje(error.message || "No se pudo cambiar la contraseña. Inténtalo nuevamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="editar_acceso" onSubmit={guardar} noValidate aria-label="Cambiar contraseña">
      <h3 className="cuenta_titulo">Cambiar contraseña</h3>
      <p>Al guardar, vuelve a iniciar sesión con tu nueva contraseña.</p>
      {[
        ["actual", "Contraseña actual", "current-password"],
        ["nueva", "Nueva contraseña", "new-password"],
        ["confirmacion", "Confirmar nueva contraseña", "new-password"],
      ].map(([campo, etiqueta, autocomplete]) => (
        <div className="editar_acceso_campo" key={campo}>
          <label htmlFor={`clave_${campo}`}>{etiqueta}</label>
          <input id={`clave_${campo}`} name={campo} type="password" autoComplete={autocomplete}
            maxLength={100} value={datos[campo]} onChange={cambiarCampo} required disabled={enviando}
            placeholder={campo === "nueva" ? "Entre 8 y 100 caracteres" : undefined}
            aria-invalid={Boolean(errores[campo])}
            aria-describedby={errores[campo] ? `error_${campo}` : undefined}
            className={errores[campo] ? "input_error" : ""} />
          {errores[campo] && <p id={`error_${campo}`} className="txt_error">{errores[campo]}</p>}
        </div>
      ))}
      <div className="editar_acceso_botones">
        <button type="submit" className="editar_acceso_validar" disabled={enviando}>
          {enviando ? "Guardando…" : "Guardar contraseña"}
        </button>
        <button type="button" className="editar_acceso_cancelar" onClick={onCancelar} disabled={enviando}>Cancelar</button>
      </div>
      {mensaje && <p role="alert" className="txt_error">{mensaje}</p>}
    </form>
  );
}

export default EditarDatosAcceso;
