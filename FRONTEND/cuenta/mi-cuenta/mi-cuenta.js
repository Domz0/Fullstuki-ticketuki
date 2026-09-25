const sesionIniciada = localStorage.getItem("sesionIniciada");
if (sesionIniciada !== "true") {
  window.location.href = "../login/login.html";
} //si no estai logueado te fuiste al lobby

const $ = (selector) => document.querySelector(selector);

const nombre = $("#nombre");
const apellido = $("#apellido");
const rut = $("#rut");
const correo = $("#correo");

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
//editar datod de micuenta
editarDatos.addEventListener("click", () => {
  formEditar.style.display = "block";
  editarDatos.style.display = "none";
});

//validacion datos nuevos
const nuevoCorreo = $("#nuevo_correo");
const nuevaPassword = $("#nueva_password");

const mensajeCorreo = $("#mensaje_correo");
const mensajePassword = $("#mensaje_password");

const guardarDatos = $("#guardar_datos");
const cancelarEdicion = $("#cancelar_edicion");

const regexCorreo = /^[^\s@]+@(duoc\.cl|gmail\.com|duocuc\.cl|profesor\.duoc\.cl)$/i;

guardarDatos.addEventListener("click", () => {
  let datosValidos = true;

  // Nuevo correo
  if (nuevoCorreo.value.trim() === "") {
    mensajeCorreo.textContent = "Ingresa un correo";
    nuevoCorreo.classList.add("input_error");
    datosValidos = false;
  } else if (nuevoCorreo.value.trim().length > 100) {
    mensajeCorreo.textContent = "El correo debe tener como máximo 100 caracteres";
    nuevoCorreo.classList.add("input_error");
    datosValidos = false;
  } else if (!regexCorreo.test(nuevoCorreo.value.trim())) {
    mensajeCorreo.textContent = "Correo no válido";
    nuevoCorreo.classList.add("input_error");
    datosValidos = false;
  } else {
    mensajeCorreo.textContent = "";
    nuevoCorreo.classList.remove("input_error");
  }

  // Nueva contraseña
  if (nuevaPassword.value.trim() === "") {
    mensajePassword.textContent = "Ingresa una contraseña";
    nuevaPassword.classList.add("input_error");
    datosValidos = false;
  } else if (nuevaPassword.value.length < 4 || nuevaPassword.value.length > 10) {
    mensajePassword.textContent = "Debe tener entre 4 y 10 caracteres";
    nuevaPassword.classList.add("input_error");
    datosValidos = false;
  } else {
    mensajePassword.textContent = "";
    nuevaPassword.classList.remove("input_error");
  }

  if (datosValidos) {
    localStorage.setItem("correo", nuevoCorreo.value.trim());
    localStorage.setItem("password", nuevaPassword.value);

    correo.textContent = nuevoCorreo.value.trim();

    formEditar.style.display = "none";
    editarDatos.style.display = "block";
  }
});
//cancelar
cancelarEdicion.addEventListener("click", () => {
  formEditar.style.display = "none";
  editarDatos.style.display = "block";

  nuevoCorreo.value = "";
  nuevaPassword.value = "";

  mensajeCorreo.textContent = "";
  mensajePassword.textContent = "";

  nuevoCorreo.classList.remove("input_error");
  nuevaPassword.classList.remove("input_error");
});
