const $ = (selector) => document.querySelector(selector);

// texto
const salidaTexto = $("#salidaTexto");
$("#btnTexto").addEventListener("click", () => {
  const texto = $("#texto").value.trim();
  if (!texto) {
    salidaTexto.textContent = "Debe ingresar texto";
    return;
  }
  salidaTexto.textContent = `Texto ingresado: ${texto}`;
});

// nums
const salidaNumero = $("#salidaNumero");
$("#btnNumero").addEventListener("click", () => {
  const numero = Number($("#numero").value);
  if (Number.isNaN(numero) || numero <= 0) {
    salidaNumero.textContent = "no es numero po chistosito";
    return;
  }
  if (numero == 67) {
    salidaNumero.textContent = `six seeeven`;
    return;
  }
  salidaNumero.textContent = `no es six seven :( -> ${numero}`;
});

// clic

const salidaClick = $("#salidaClick");
$("#btnClick").addEventListener("click", () => {
  salidaClick.textContent = "El botón detectó el click";
});

// chequeo
const formEjemplo = $("#formEjemplo");
const salidaForm = $("#salidaForm");
formEjemplo.addEventListener("submit", (e) => {
  e.preventDefault(); // Evita que el formulario recargue la página
  const nombre = $("#nombreForm").value.trim();
  if (!nombre) {
    salidaForm.textContent = "Debe ingresar un nombre";
    return;
  }
  salidaForm.textContent = `Formulario enviado. Hola ${nombre}`;
});

// correo
const salidaCorreo = $("#salidaCorreo");
const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
$("#btnCorreo").addEventListener("click", () => {
  const correo = $("#correo").value.trim();
  if (!correo) {
    salidaCorreo.textContent = "escribe algo po";
    return;
  }
  if (!regexCorreo.test(correo)) {
    salidaCorreo.textContent = "no correito";
    return;
  }
  salidaCorreo.textContent = "si correito";
});

// inicio
let sesionIniciada = false;
$("#btnSesion").addEventListener("click", () => {
  sesionIniciada = !sesionIniciada;

  if (sesionIniciada) {
    $("#zonaSesion").innerHTML = "<strong>Mi cuenta</strong> · Camila Vergara";
    $("#btnSesion").textContent = "Cerrar sesión";
    $("#salidaSesion").textContent = "iniciado";
  } else {
    $("#zonaSesion").textContent = "Iniciar sesión · Registrar usuario";
    $("#btnSesion").textContent = "Iniciar sesión";
    $("#salidaSesion").textContent = "no iniciado";
  }
});

// seleccion de botones
const opcionesCuotas = document.querySelectorAll(".cuota_ejemplo");

opcionesCuotas.forEach((opcion) => {
  opcion.addEventListener("click", () => {
    opcionesCuotas.forEach((otraOpcion) => {
      otraOpcion.classList.remove("seleccionada");
      otraOpcion.setAttribute("aria-pressed", "false");
    });
    opcion.classList.add("seleccionada");
    opcion.setAttribute("aria-pressed", "true");
    $("#salidaCuotas").textContent = "esta en -> " + opcion.textContent;
  });
});
