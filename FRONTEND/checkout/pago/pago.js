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
