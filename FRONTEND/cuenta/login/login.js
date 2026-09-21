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

  if (datosValidos) {
    const correoGuardado = localStorage.getItem("correo");
    const passwordGuardada = localStorage.getItem("password");

    if (
      email.value.trim() === correoGuardado &&
      password.value === passwordGuardada
    ) {
      //usando esto podemos dejar que despues del registro quede como iniciado igual
      localStorage.setItem("sesionIniciada", "true");
      //voy a intentar conectar a mi-cuenta, esto hay que cambiarlo
      window.location.href = "../../index.html";
      //window.location.href = "../mi-cuenta/mi-cuenta.html";

    } else if (
      email.value.trim() === "admin@duocuc.cl" &&
      password.value === "Admin1234"

    ) {
      localStorage.setItem("sesionIniciada", "true");
      window.location.href = "../../admin.html";
    } else {
      mensajePassword.textContent = "Correo o contraseña incorrectos";
    }
  }
});
