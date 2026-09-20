// tipo pago
const opcionesPago = document.querySelectorAll(".pago_opcion");

opcionesPago.forEach((opcion) => {
  opcion.addEventListener("click", () => {
    opcionesPago.forEach((otraOpcion) => {
      otraOpcion.classList.remove("pago_opcion_marcada");
    });

    opcion.classList.add("pago_opcion_marcada");

    const radio = opcion.querySelector('input[type="radio"]');
    radio.checked = true;
  });
});



//selec de coutas
const opcionesCuotas = document.querySelectorAll(".pago_cuota");

opcionesCuotas.forEach((cuota) => {
  cuota.addEventListener("click", () => {
    opcionesCuotas.forEach((otraCuota) => {
      otraCuota.classList.remove("pago_cuota_marcada");
    });

    cuota.classList.add("pago_cuota_marcada");
  });
});

//codigo
const botonAplicar = document.querySelector(".pago_aplicar");
const inputCodigo = document.querySelector("#codigo");
const mensajeCodigo = document.querySelector("#mensaje_codigo");

botonAplicar.addEventListener("click", () => {
  const codigo = inputCodigo.value;

  if (codigo === "ROCK20") {
    mensajeCodigo.textContent = "Código válido!";
  } else {
    mensajeCodigo.textContent = "Código no válido";
  }
});

//datos comrpandoe
const nombre = document.querySelector("#nombre");
const apellido = document.querySelector("#apellido");
const rut = document.querySelector("#rut");
const correo = document.querySelector("#correo");

const mensajeNombre = document.querySelector("#mensaje_nombre");
const mensajeApellido = document.querySelector("#mensaje_apellido");
const mensajeRut = document.querySelector("#mensaje_rut");
const mensajeCorreo = document.querySelector("#mensaje_correo");

function validarDatos() {
  let datosValidos = true;
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (nombre.value.trim() === "") {
    mensajeNombre.textContent = "Ingresa tu nombre";
    datosValidos = false;
  } else {
    mensajeNombre.textContent = "";
  }
  if (apellido.value.trim() === "") {
    mensajeApellido.textContent = "Ingresa tu apellido";
    datosValidos = false;
  } else {
    mensajeApellido.textContent = "";
  }
  if (rut.value.trim() === "") {
    mensajeRut.textContent = "Ingresa tu rut";
    datosValidos = false;
  } else {
    mensajeRut.textContent = "";
  }
  if (correo.value.trim() === "") {
    mensajeCorreo.textContent = "Ingresa tu correo";
    datosValidos = false;
  } else if (!regexCorreo.test(correo.value.trim())) {
    mensajeCorreo.textContent = "Ingresa un correo valido";
    datosValidos = false;
  } else {
    mensajeCorreo.textContent = "";
  }
  return datosValidos;
}


if (localStorage.getItem("sesionIniciada")) {

  const nombreGuardado = localStorage.getItem("nombre");
  const apellidoGuardado = localStorage.getItem("apellido");
  const rutGuardado = localStorage.getItem("rut");
  const correoGuardado = localStorage.getItem("correo");

  document.getElementById("nombre").value = nombreGuardado;
  document.getElementById("apellido").value = apellidoGuardado;
  document.getElementById("rut").value = rutGuardado;
  document.getElementById("correo").value = correoGuardado;
}

// pagar mobile y desktop
const botonesPagar = document.querySelectorAll(
  ".boton_comprar, .boton_comprar_mobile",
);

botonesPagar.forEach((boton) => {
  boton.addEventListener("click", () => {
    if (validarDatos()) {
      window.location.href = "../confirmacion/confirmacion.html";
    }
  });
});

// ----- resumen de la compra -----
// Los datos los dejo la pantalla de entradas en localStorage.

const escribirResumen = (selector, texto) => {
  document.querySelectorAll(selector).forEach((nodo) => {
    nodo.textContent = texto;
  });
};

if (localStorage.getItem("compraArea")) {
  escribirResumen("[data-resumen-evento]", localStorage.getItem("compraEvento"));
  escribirResumen("[data-resumen-fecha]", localStorage.getItem("compraFecha"));
  escribirResumen("[data-resumen-recinto]", localStorage.getItem("compraRecinto"));
  escribirResumen("[data-resumen-area]", localStorage.getItem("compraArea"));
  escribirResumen("[data-resumen-linea]", localStorage.getItem("compraLinea"));
  escribirResumen("[data-resumen-subtotal]", localStorage.getItem("compraSubtotal"));
  escribirResumen("[data-resumen-cargo]", localStorage.getItem("compraCargo"));
  escribirResumen("[data-resumen-total]", localStorage.getItem("compraTotal"));
}
