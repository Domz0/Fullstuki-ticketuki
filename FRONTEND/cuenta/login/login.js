const $ = (selector) => document.querySelector(selector);

const formulario = $("form");

const email = $("#email");
const password = $("#password");

const mensajeEmail = $("#mensaje_email");
const mensajePassword = $("#mensaje_password");

const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  let datosValidos = true;

  if (email.value.trim() === "") {
    mensajeEmail.textContent = "Ingresa tu correo";
    datosValidos = false;
  } else if (!regexCorreo.test(email.value.trim())) {
    mensajeEmail.textContent = "Correo no válido";
    datosValidos = false;
  } else {
    mensajeEmail.textContent = "";
  }

  if (password.value.trim() === "") {
    mensajePassword.textContent = "Ingresa tu contraseña";
    datosValidos = false;
  } else {
    mensajePassword.textContent = "";
  }
});
