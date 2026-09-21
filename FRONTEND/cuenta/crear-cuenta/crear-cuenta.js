const $ = (selector) => document.querySelector(selector);

const formulario = $("#formulario_crear_cuenta");

const nombre = $("#nombre");
const apellido = $("#apellido");
const rut = $("#rut");
const mail = $("#mail");
const password = $("#password");
const checkbox = $("#checkbox");

const mensajeNombre = $("#mensaje_nombre");
const mensajeApellido = $("#mensaje_apellido");
const mensajeRut = $("#mensaje_rut");
const mensajeMail = $("#mensaje_mail");
const mensajePassword = $("#mensaje_password");
const mensajeCheckbox = $("#mensaje_checkbox");

const regexCorreo = /^[^\s@]+@(duoc\.cl|gmail\.com|duocuc\.cl|profesor\.duoc\.cl)$/i;
// Formato del RUT con o sin puntos y con guion antes del digito verificador.
const regexRut = /^([0-9]{7,8}|[0-9]{1,2}\.[0-9]{3}\.[0-9]{3})-[0-9kK]$/;

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  let datosValidos = true;

  // Nombre
  if (nombre.value.trim() === "") {
    mensajeNombre.textContent = "Ingresa tu nombre";
    datosValidos = false;
  } else {
    mensajeNombre.textContent = "";
  }

  // Apellido
  if (apellido.value.trim() === "") {
    mensajeApellido.textContent = "Ingresa tu apellido";
    datosValidos = false;
  } else {
    mensajeApellido.textContent = "";
  }

  // RUT
  if (rut.value.trim() === "") {
    mensajeRut.textContent = "Ingresa tu RUT";
    datosValidos = false;
  } else if (!regexRut.test(rut.value.trim())) {
    mensajeRut.textContent = "Usa el formato 12.345.678-5 o 12345678-5";
    datosValidos = false;
  } else {
    mensajeRut.textContent = "";
  }

  // Correo
  if (mail.value.trim() === "") {
    mensajeMail.textContent = "Ingresa tu correo";
    datosValidos = false;
  } else if (mail.value.trim().length > 100) {
    mensajeMail.textContent = "El correo debe tener como máximo 100 caracteres";
    datosValidos = false;
  } else if (!regexCorreo.test(mail.value.trim())) {
    mensajeMail.textContent = "Correo no válido";
    datosValidos = false;
  } else {
    mensajeMail.textContent = "";
  }

  // Contraseña
  if (password.value.trim() === "") {
    mensajePassword.textContent = "Ingresa una contraseña";
    datosValidos = false;
  } else if (password.value.length < 4 || password.value.length > 10) {
    mensajePassword.textContent = "Debe tener entre 4 y 10 caracteres";
    datosValidos = false;
  } else {
    mensajePassword.textContent = "";
  }

  // Términos
  if (!checkbox.checked) {
    mensajeCheckbox.textContent = "Debes aceptar los términos";
    datosValidos = false;
  } else {
    mensajeCheckbox.textContent = "";
  }
  if (datosValidos) {
    localStorage.setItem("nombre", nombre.value.trim());
    localStorage.setItem("apellido", apellido.value.trim());
    localStorage.setItem("rut", rut.value.trim());
    localStorage.setItem("correo", mail.value.trim());
    localStorage.setItem("password", password.value);

    window.location.href = "../login/login.html";
  }
});
