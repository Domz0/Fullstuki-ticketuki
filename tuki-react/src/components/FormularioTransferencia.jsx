import { useState } from "react";
import { validarTransferencia } from "../utils/validarTransferencia";

const campos = [
  { nombre: "nombre", etiqueta: "Nombre", tipo: "text", ayuda: "Nombre y apellido", maximo: 100 },
  { nombre: "rut", etiqueta: "RUT", tipo: "text", ayuda: "Ej: 12.345.678-5", maximo: 12 },
  { nombre: "correo", etiqueta: "Correo electrónico", tipo: "email", ayuda: "Correo electrónico", maximo: 100 },
];

function FormularioTransferencia({ usuario, onValidado }) {
  const [datos, setDatos] = useState({ nombre: "", rut: "", correo: "" });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");

  function cambiar(event) {
    const { name, value } = event.target;
    setDatos({ ...datos, [name]: value });
    setErrores({ ...errores, [name]: "" });
    setMensaje("");
  }

  function enviar(event) {
    event.preventDefault();
    const nuevosErrores = validarTransferencia(datos, usuario);
    setErrores(nuevosErrores);
    const primerError = Object.keys(nuevosErrores)[0];
    if (primerError) {
      setMensaje("Revisa los campos marcados.");
      event.currentTarget.elements.namedItem(primerError).focus();
      return;
    }
    const resultado = onValidado(datos);
    if (resultado?.error) setMensaje(resultado.error);
  }

  return (
    <form className="transferir_formulario" onSubmit={enviar} noValidate autoComplete="off">
      <h2>Datos del nuevo titular</h2>
      {campos.map((campo) => (
        <div className="transferir_campo" key={campo.nombre}>
          <label htmlFor={`transferir_${campo.nombre}`}>{campo.etiqueta}</label>
          <input
            id={`transferir_${campo.nombre}`}
            name={campo.nombre}
            type={campo.tipo}
            placeholder={campo.ayuda}
            maxLength={campo.maximo}
            value={datos[campo.nombre]}
            onChange={cambiar}
            required
            className={errores[campo.nombre] ? "input_error" : ""}
            aria-invalid={Boolean(errores[campo.nombre])}
            aria-describedby={errores[campo.nombre] ? `error_transferir_${campo.nombre}` : undefined}
          />
          {errores[campo.nombre] && (
            <p id={`error_transferir_${campo.nombre}`} className="txt_error">
              {errores[campo.nombre]}
            </p>
          )}
        </div>
      ))}
      <button type="submit" className="boton morado">Transferir entrada</button>
      <p role="status" className="txt_error">{mensaje}</p>
    </form>
  );
}

export default FormularioTransferencia;
