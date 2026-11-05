import { useState } from "react";
import { validarPago } from "../utils/validarPago";
import "./FormularioPago.css";

function CampoPago({
  nombre,
  etiqueta,
  valor,
  error,
  onChange,
  type = "text",
  placeholder,
  maxLength,
  inputMode,
}) {
  return (
    <div className="pago_caja">
      <label htmlFor={`pago_${nombre}`}>{etiqueta}</label>
      <input
        id={`pago_${nombre}`}
        name={nombre}
        type={type}
        value={valor}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        required
        className={error ? "input_error" : ""}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `error_${nombre}` : undefined}
      />
      {error && (
        <p id={`error_${nombre}`} className="txt_error">
          {error}
        </p>
      )}
    </div>
  );
}

function FormularioPago() {
  const [datos, setDatos] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    correo: "",
    numero_tarjeta: "",
    vencimiento: "",
    cvv: "",
  });
  const [metodo, setMetodo] = useState("debito");
  const [cuotas, setCuotas] = useState(1);
  const [codigo, setCodigo] = useState("");
  const [mensajeCodigo, setMensajeCodigo] = useState("");
  const [errores, setErrores] = useState({});
  const [validado, setValidado] = useState(false);
  const [mensaje, setMensaje] = useState("");

  function cambiarCampo(event) {
    const nuevosDatos = { ...datos, [event.target.name]: event.target.value };
    setDatos(nuevosDatos);
    setMensaje("");
    if (validado) setErrores(validarPago(nuevosDatos, metodo));
  }

  function cambiarMetodo(event) {
    const nuevoMetodo = event.target.value;
    // borra datos al cambiar
    const nuevosDatos = {
      ...datos,
      numero_tarjeta: "",
      vencimiento: "",
      cvv: "",
    };
    setDatos(nuevosDatos);
    setMetodo(nuevoMetodo);
    setCuotas(1);
    setMensaje("");
    if (validado) setErrores(validarPago(nuevosDatos, nuevoMetodo));
  }

  function comprobarDatos(event) {
    event.preventDefault();
    const nuevosErrores = validarPago(datos, metodo);
    setErrores(nuevosErrores);
    setValidado(true);
    setMensaje(
      Object.keys(nuevosErrores).length === 0
        ? "Los datos cumplen las comprobaciones de formato. No se realizó ningún pago ni se guardaron los datos."
        : "Revisa los campos marcados.",
    );
    if (Object.keys(nuevosErrores).length > 0) {
      event.currentTarget.elements
        .namedItem(Object.keys(nuevosErrores)[0])
        .focus();
    }
  }

  function campo(nombre, etiqueta, opciones = {}) {
    return (
      <CampoPago
        nombre={nombre}
        etiqueta={etiqueta}
        valor={datos[nombre]}
        error={errores[nombre]}
        onChange={cambiarCampo}
        {...opciones}
      />
    );
  }

  return (
    <section
      className="formulario_pago pagina_pago"
      aria-labelledby="titulo_pago"
    >
      <h2 id="titulo_pago">Formulario de pago</h2>
      <form
        className="pago_formulario"
        onSubmit={comprobarDatos}
        noValidate
        autoComplete="off"
      >
        <div className="pago_bloque">
          <h3>Datos del comprador</h3>
          <div className="pago_fila">
            {campo("nombre", "Nombre", { placeholder: "Nombre" })}
            {campo("apellido", "Apellido", { placeholder: "Apellido" })}
          </div>
          <div className="pago_fila">
            {campo("rut", "RUT", {
              placeholder: "Ej: 12.345.678-5",
              maxLength: 12,
            })}
            {campo("correo", "Correo electrónico", {
              type: "email",
              placeholder: "Correo electrónico",
              maxLength: 100,
            })}
          </div>
        </div>

        <div className="pago_bloque pago_descuento">
          <h3>Código de descuento</h3>
          <div className="pago_caja">
            <label htmlFor="pago_codigo">Ingresa tu código (opcional)</label>
            <div className="pago_codigo_fila">
              <input
                id="pago_codigo"
                type="text"
                value={codigo}
                placeholder="Código de descuento"
                onChange={(event) => {
                  setCodigo(event.target.value);
                  setMensajeCodigo("");
                }}
              />
              <button
                type="button"
                className="boton pago_aplicar"
                onClick={() =>
                  setMensajeCodigo(
                    codigo.trim() === "ROCK20"
                      ? "Código válido. Solo comprobación, sin aplicar descuento."
                      : "Código no válido",
                  )
                }
              >
                Comprobar
              </button>
            </div>
            <p
              role="status"
              className={codigo.trim() === "ROCK20" ? "txt_exito" : "txt_error"}
            >
              {mensajeCodigo}
            </p>
          </div>
        </div>

        <div className="pago_bloque">
          <h3 id="titulo_metodo">Método de pago</h3>
          <div
            className="pago_metodos"
            role="radiogroup"
            aria-labelledby="titulo_metodo"
          >
            <div className="pago_fila">
              {[
                {
                  valor: "debito",
                  nombre: "Débito",
                  detalle: "Pago con tarjeta de débito",
                },
                {
                  valor: "credito",
                  nombre: "Crédito",
                  detalle: "Pago con tarjeta de crédito",
                },
              ].map((opcion) => (
                <label
                  key={opcion.valor}
                  className={`pago_opcion ${metodo === opcion.valor ? "pago_opcion_marcada" : ""}`}
                >
                  <span className="pago_opcion_logo" aria-hidden="true"></span>
                  <span className="pago_opcion_texto">
                    {opcion.nombre}
                    <small>{opcion.detalle}</small>
                  </span>
                  <input
                    type="radio"
                    name="metodo_pago"
                    value={opcion.valor}
                    checked={metodo === opcion.valor}
                    onChange={cambiarMetodo}
                  />
                </label>
              ))}
            </div>
            <div className="pago_fila">
              <label
                className={`pago_opcion ${metodo === "transferencia" ? "pago_opcion_marcada" : ""}`}
              >
                <span className="pago_opcion_logo" aria-hidden="true"></span>
                <span className="pago_opcion_texto">
                  Transferencia bancaria
                  <small>Pago mediante transferencia</small>
                </span>
                <input
                  type="radio"
                  name="metodo_pago"
                  value="transferencia"
                  checked={metodo === "transferencia"}
                  onChange={cambiarMetodo}
                />
              </label>
              <div className="pago_hueco" aria-hidden="true"></div>
            </div>
          </div>

          {metodo === "credito" && (
            <div className="pago_tarjeta">
              <div className="separador"></div>
              <h3>Datos de la tarjeta</h3>
              {campo("numero_tarjeta", "Dígitos de tarjeta", {
                placeholder: "0000 0000 0000 0000",
                maxLength: 19,
                inputMode: "numeric",
              })}
              <div className="pago_fila">
                {campo("vencimiento", "Fecha de vencimiento", {
                  placeholder: "MM/AA",
                  maxLength: 5,
                })}
                {campo("cvv", "CVV", {
                  type: "password",
                  placeholder: "123",
                  maxLength: 4,
                  inputMode: "numeric",
                })}
              </div>
              <div className="pago_cuotas">
                <p>Cuotas sin interés</p>
                <div className="pago_fila">
                  {[1, 3, 6, 12].map((cantidad) => (
                    <button
                      key={cantidad}
                      type="button"
                      aria-pressed={cuotas === cantidad}
                      className={`pago_cuota ${cuotas === cantidad ? "pago_cuota_marcada" : ""}`}
                      onClick={() => setCuotas(cantidad)}
                    >
                      {cantidad === 1 ? "Sin cuotas" : `${cantidad} cuotas`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {metodo === "transferencia" && (
            <p className="texto_secundario">
              Transferencia seleccionada. En esta vista solo se comprueban los
              datos del comprador.
            </p>
          )}
        </div>
        <button type="submit" className="boton morado boton_comprar">
          Validar datos
        </button>
        <p
          role="status"
          className={Object.keys(errores).length ? "txt_error" : "txt_exito"}
        >
          {mensaje}
        </p>
      </form>
    </section>
  );
}

export default FormularioPago;
