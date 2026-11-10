import ImagenAcceso from "./ImagenAcceso";
import { useState } from "react";
import { validarRegistro } from "../utils/validarRegistro";
import "./FormularioRegistro.css";

function FormularioRegistro({ onValidado }) {
  const [datos, setDatos] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    correo: "",
    password: "",
    terminos: false,
  });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");

  function cambiarCampo(event) {
    const { name, type, checked, value } = event.target;
    setDatos({ ...datos, [name]: type === "checkbox" ? checked : value });
    setErrores({ ...errores, [name]: "" });
    setMensaje("");
  }

  function comprobarRegistro(event) {
    event.preventDefault();
    const nuevosErrores = validarRegistro(datos);
    setErrores(nuevosErrores);
    const primerError = Object.keys(nuevosErrores)[0];
    if (primerError) {
      setMensaje("Revisa los campos marcados.");
      event.currentTarget.elements.namedItem(primerError).focus();
    } else {
      const resultado = onValidado(datos);
      if (resultado?.error) {
        setErrores({ correo: resultado.error });
        setMensaje(resultado.error);
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
          required
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
            {campo("nombre", "Nombre", { placeholder: "Nombre" })}
            {campo("apellido", "Apellido", { placeholder: "Apellido" })}
          </div>
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
            placeholder: "Entre 4 y 10 caracteres",
            maxLength: 10,
            autoComplete: "new-password",
          })}
          <div className="registro_terminos">
            <div className="registro_aceptacion">
              <input
                id="registro_terminos"
                name="terminos"
                type="checkbox"
                checked={datos.terminos}
                onChange={cambiarCampo}
                required
                aria-invalid={Boolean(errores.terminos)}
                aria-describedby={
                  errores.terminos ? "registro_error_terminos" : undefined
                }
              />
              <label htmlFor="registro_terminos">
                Acepto los términos y la política de privacidad
              </label>
            </div>
            {errores.terminos && (
              <p id="registro_error_terminos" className="txt_error">
                {errores.terminos}
              </p>
            )}
          </div>
          <button type="submit">Crear cuenta</button>
          <p
            role="status"
            className={
              Object.values(errores).some(Boolean) ? "txt_error" : "txt_exito"
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
