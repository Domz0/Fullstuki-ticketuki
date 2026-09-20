const sesionIniciada = localStorage.getItem("sesionIniciada");
if (sesionIniciada !== "true") {
  window.location.href = "../login/login.html";
} //si no estai logueado te fuiste al lobby

const $ = (selector) => document.querySelector(selector);

const nombre = $("#nombre");
const apellido = $("#apellido");
const rut = $("#rut");
const correo = $("#correo");

const nombreCompleto = $("#nombre_completo");
const iniciales = $("#iniciales");

const nombreGuardado = localStorage.getItem("nombre");
const apellidoGuardado = localStorage.getItem("apellido");
const rutGuardado = localStorage.getItem("rut");
const correoGuardado = localStorage.getItem("correo");

const editarDatos = $("#editar_datos");
const formEditar = $("#form_editar");

nombre.textContent = nombreGuardado;
apellido.textContent = apellidoGuardado;
rut.textContent = rutGuardado;
correo.textContent = correoGuardado;

nombreCompleto.textContent = nombreGuardado + " " + apellidoGuardado;
iniciales.textContent = nombreGuardado.charAt(0) + apellidoGuardado.charAt(0);

//cierre de sesion
const cerrarSesion = $("#cerrar_sesion");

cerrarSesion.addEventListener("click", () => {
  localStorage.setItem("sesionIniciada", "false");
});
//editar datod de micuenta
editarDatos.addEventListener("click", () => {
  formEditar.style.display = "block";
  editarDatos.style.display = "none";
});
//cancelar
const cancelarEdicion = $("#cancelar_edicion");
cancelarEdicion.addEventListener("click", () => {
  formEditar.style.display = "none";
  editarDatos.style.display = "block";
});

//validacion datos nuevos
const nuevoCorreo = $("#nuevo_correo");
const nuevaPassword = $("#nueva_password");

const mensajeCorreo = $("#mensaje_correo");
const mensajePassword = $("#mensaje_password");

const guardarDatos = $("#guardar_datos");

const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexMayuscula = /[A-Z]/;

guardarDatos.addEventListener("click", () => {
  let datosValidos = true;

  // Nuevo correo
  if (nuevoCorreo.value.trim() === "") {
    mensajeCorreo.textContent = "Ingresa un correo";
    datosValidos = false;
  } else if (!regexCorreo.test(nuevoCorreo.value.trim())) {
    mensajeCorreo.textContent = "Correo no válido";
    datosValidos = false;
  } else {
    mensajeCorreo.textContent = "";
  }

  // Nueva contraseña
  if (nuevaPassword.value.trim() === "") {
    mensajePassword.textContent = "Ingresa una contraseña";
    datosValidos = false;
  } else if (nuevaPassword.value.length < 8) {
    mensajePassword.textContent = "Debe tener mínimo 8 caracteres";
    datosValidos = false;
  } else if (!regexMayuscula.test(nuevaPassword.value)) {
    mensajePassword.textContent = "Debe contener al menos una mayúscula";
    datosValidos = false;
  } else {
    mensajePassword.textContent = "";
  }

  if (datosValidos) {
    localStorage.setItem("correo", nuevoCorreo.value.trim());
    localStorage.setItem("password", nuevaPassword.value);

    correo.textContent = nuevoCorreo.value.trim();

    formEditar.style.display = "none";
    editarDatos.style.display = "block";
  }
});
