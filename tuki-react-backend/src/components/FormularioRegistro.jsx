import ImagenAcceso from "./ImagenAcceso";
import { useState } from "react";
import { validarRegistro } from "../utils/validarRegistro";
import "./FormularioRegistro.css";

function FormularioRegistro({ onValidado }) {
  const [datos, setDatos] = useState({
    nombre: "",
    segundoNombre: "",
    apellido: "",
    apellidoMaterno: "",
    username: "",
    rut: "",
    correo: "",
    password: "",
    confirmacionPassword: "",
  });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiarCampo(event) {
    const { name, type, checked, value } = event.target;
    setDatos({ ...datos, [name]: type === "checkbox" ? checked : value });
    setErrores({ ...errores, [name]: "" });
    setMensaje("");
  }

  async function comprobarRegistro(event) {
    event.preventDefault();
    if (enviando) return;
    setMensaje("");
    const nuevosErrores = validarRegistro(datos);
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
          setErrores(resultado.errores || {});
          setMensaje(resultado.error);
        }
      } catch {
        setMensaje("No se pudo crear la cuenta. Inténtalo nuevamente.");
      } finally {
        setEnviando(false);
      }
    }
  }

  function campo(nombre, etiqueta, opciones = {}) {
    return (
      <div className="registro_campo">
        <label htmlFor={`registro_${nombre}`}>{etiqueta}</label>
        <input
          id={`registro_${nombre}`}
          name={nombre}
          type="text"
          {...opciones}
          value={datos[nombre]}
          onChange={cambiarCampo}
          required={opciones.required !== false}
          disabled={enviando}
          className={errores[nombre] ? "input_error" : ""}
          aria-invalid={Boolean(errores[nombre])}
          aria-describedby={
            errores[nombre] ? `registro_error_${nombre}` : undefined
          }
        />
        {errores[nombre] && (
          <p id={`registro_error_${nombre}`} className="txt_error">
            {errores[nombre]}
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="registro" aria-labelledby="titulo_registro">
      <div className="registro_contenido">
        <a href="#/inicio" className="registro_marca">
          Ticketuki
        </a>
        <form
          className="registro_formulario"
          onSubmit={comprobarRegistro}
          noValidate
          autoComplete="off"
        >
          <h2 id="titulo_registro">Crea tu cuenta</h2>
          <p className="registro_subtitulo">Solo toma un minuto</p>
          <div className="registro_fila">
            {campo("nombre", "Primer nombre", { maxLength: 25 })}
            {campo("segundoNombre", "Segundo nombre (opcional)", { maxLength: 25, required: false })}
          </div>
          <div className="registro_fila">
            {campo("apellido", "Apellido paterno", { maxLength: 25 })}
            {campo("apellidoMaterno", "Apellido materno (opcional)", { maxLength: 25, required: false })}
          </div>
          {campo("username", "Nombre de usuario", { maxLength: 50, autoComplete: "username" })}
          {campo("rut", "RUT", {
            placeholder: "Ej: 12.345.678-5",
            maxLength: 12,
          })}
          {campo("correo", "Correo electrónico", {
            type: "email",
            placeholder: "tu@correo.com",
            maxLength: 100,
          })}
          {campo("password", "Contraseña", {
            type: "password",
            placeholder: "Entre 8 y 100 caracteres",
            maxLength: 100,
            autoComplete: "new-password",
          })}
          {campo("confirmacionPassword", "Confirmación de contraseña", {
            type: "password",
            maxLength: 100,
            autoComplete: "new-password",
          })}
          <button type="submit" disabled={enviando}>
            {enviando ? "Creando cuenta..." : "Crear cuenta"}
          </button>
          <p
            role="status"
            className={
              mensaje ? "txt_error" : "txt_exito"
            }
          >
            {mensaje}
          </p>
          <p className="registro_ingresar">
            ¿Ya tienes cuenta? <a href="#/login">Ingresar</a>
          </p>
        </form>
      </div>
      <ImagenAcceso className="registro_imagen" />
    </section>
  );
}

export default FormularioRegistro;
