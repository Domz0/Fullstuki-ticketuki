// ----- resumen de la compra -----

const escribirResumen = (selector, texto) => {
  document.querySelectorAll(selector).forEach((nodo) => {
    nodo.textContent = texto;
  });
};

// ----- datos de la compra -----

if (localStorage.getItem("compraArea")) {
  escribirResumen(
    "[data-resumen-evento]",
    localStorage.getItem("compraEvento"),
  );
  escribirResumen("[data-resumen-fecha]", localStorage.getItem("compraFecha"));
  escribirResumen(
    "[data-resumen-recinto]",
    localStorage.getItem("compraRecinto"),
  );
  escribirResumen("[data-resumen-area]", localStorage.getItem("compraArea"));
  escribirResumen("[data-resumen-linea]", localStorage.getItem("compraLinea"));
  escribirResumen(
    "[data-resumen-subtotal]",
    localStorage.getItem("compraSubtotal"),
  );
  escribirResumen("[data-resumen-cargo]", localStorage.getItem("compraCargo"));
  escribirResumen("[data-resumen-total]", localStorage.getItem("compraTotal"));
}

// ----- total -----

const totalGuardado = localStorage.getItem("compraTotal");

let total = 0;

if (totalGuardado) {
  total = Number(totalGuardado.replace("$", "").replaceAll(".", "").trim());
}

let descuentoAplicado = false;

function formatoPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CL");
}

// ----- tipo de pago -----
const opcionesPago = document.querySelectorAll(".pago_opcion");
const datosTarjeta = document.querySelector(".pago_tarjeta");
const datosTransferencia = document.querySelector(".pago_transferencia");

// débito viene seleccionado por defecto
datosTarjeta.style.display = "none";
datosTransferencia.style.display = "none";

opcionesPago.forEach((opcion) => {
  opcion.addEventListener("click", () => {
    // quitar selección anterior
    opcionesPago.forEach((otraOpcion) => {
      otraOpcion.classList.remove("pago_opcion_marcada");
    });

    opcion.classList.add("pago_opcion_marcada");

    const radio = opcion.querySelector('input[type="radio"]');
    radio.checked = true;

    if (radio.value === "Crédito") {
      datosTarjeta.style.display = "flex";
      datosTransferencia.style.display = "none";
    } else if (radio.value === "Transferencia bancaria") {
      datosTarjeta.style.display = "none";
      datosTransferencia.style.display = "flex";
    } else {
      // débito
      datosTarjeta.style.display = "none";
      datosTransferencia.style.display = "none";
    }
  });
});

// ----- selección de cuotas -----
const opcionesCuotas = document.querySelectorAll(".pago_cuota");

opcionesCuotas.forEach((cuota) => {
  cuota.addEventListener("click", () => {
    opcionesCuotas.forEach((otraCuota) => {
      otraCuota.classList.remove("pago_cuota_marcada");
    });

    cuota.classList.add("pago_cuota_marcada");
  });
});

// ----- código de descuento -----
const botonAplicar = document.querySelector(".pago_aplicar");
const inputCodigo = document.querySelector("#codigo");
const mensajeCodigo = document.querySelector("#mensaje_codigo");
botonAplicar.addEventListener("click", () => {
  const codigo = inputCodigo.value.trim();

  if (codigo === "ROCK20" && descuentoAplicado === false) {
    const descuento = total * 0.2;

    total = total - descuento;
    descuentoAplicado = true;
    mensajeCodigo.textContent = "Código válido! Descuento aplicado";

    escribirResumen("[data-resumen-total]", formatoPrecio(total));
  } else if (codigo === "ROCK20" && descuentoAplicado === true) {
    mensajeCodigo.textContent = "El descuento ya fue aplicado";
  } else {
    mensajeCodigo.textContent = "Código no válido";
  }
});

// ----- datos comprador -----

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

  const regexCorreo = /^[^\s@]+@(duoc\.cl|gmail\.com|duocuc\.cl|profesor\.duoc\.cl)$/i;
  // Formato del RUT con o sin puntos y con guion antes del digito verificador.
  const regexRut = /^([0-9]{7,8}|[0-9]{1,2}\.[0-9]{3}\.[0-9]{3})-[0-9kK]$/;

  // nombre
  if (nombre.value.trim() === "") {
    mensajeNombre.textContent = "Ingresa tu nombre";

    datosValidos = false;
  } else {
    mensajeNombre.textContent = "";
  }

  // apellido
  if (apellido.value.trim() === "") {
    mensajeApellido.textContent = "Ingresa tu apellido";

    datosValidos = false;
  } else {
    mensajeApellido.textContent = "";
  }

  // rut
  if (rut.value.trim() === "") {
    mensajeRut.textContent = "Ingresa tu rut";

    datosValidos = false;
  } else if (!regexRut.test(rut.value.trim())) {
    mensajeRut.textContent = "Usa el formato 12.345.678-5 o 12345678-5";
    datosValidos = false;
  } else {
    mensajeRut.textContent = "";
  }

  // correo
  if (correo.value.trim() === "") {
    mensajeCorreo.textContent = "Ingresa tu correo";

    datosValidos = false;
  } else if (correo.value.trim().length > 100) {
    mensajeCorreo.textContent = "El correo debe tener como máximo 100 caracteres";
    datosValidos = false;
  } else if (!regexCorreo.test(correo.value.trim())) {
    mensajeCorreo.textContent = "Ingresa un correo válido";

    datosValidos = false;
  } else {
    mensajeCorreo.textContent = "";
  }
  return datosValidos;
}

// ----- cargar datos usuario si inició sesión -----

if (localStorage.getItem("sesionIniciada") === "true") {
  const nombreGuardado = localStorage.getItem("nombre");
  const apellidoGuardado = localStorage.getItem("apellido");
  const rutGuardado = localStorage.getItem("rut");
  const correoGuardado = localStorage.getItem("correo");

  if (nombreGuardado) {
    nombre.value = nombreGuardado;
  }
  if (apellidoGuardado) {
    apellido.value = apellidoGuardado;
  }
  if (rutGuardado) {
    rut.value = rutGuardado;
  }
  if (correoGuardado) {
    correo.value = correoGuardado;
  }
}

// ----- validar tarjeta de crédito -----

const numeroTarjeta = document.querySelector("#numero_tarjeta");
const mensajeTarjeta = document.querySelector("#mensaje_tarjeta");

function validarTarjeta() {
  const metodoSeleccionado = document.querySelector(
    'input[name="metodo_pago"]:checked',
  );

  // solo validamos si eligió crédito
  if (metodoSeleccionado && metodoSeleccionado.value === "Crédito") {
    const regexTarjeta = /^[0-9]{16}$/;

    if (!regexTarjeta.test(numeroTarjeta.value.trim())) {
      mensajeTarjeta.textContent = "La tarjeta debe tener 16 números";

      return false;
    }
  }

  mensajeTarjeta.textContent = "";

  return true;
}

const botonesPagar = document.querySelectorAll(
  ".boton_comprar, .boton_comprar_mobile",
);

botonesPagar.forEach((boton) => {
  boton.addEventListener("click", () => {
    const datosValidos = validarDatos();
    const tarjetaValida = validarTarjeta();

    if (datosValidos && tarjetaValida) {
      const metodoSeleccionado = document.querySelector(
        'input[name="metodo_pago"]:checked',
      );

      if (metodoSeleccionado) {
        // guardar para confirmación
        localStorage.setItem("metodo_pago", metodoSeleccionado.value);

        localStorage.setItem("total_pagado", total);

        window.location.href = "../confirmacion/confirmacion.html";
      }
    }
  });
});
