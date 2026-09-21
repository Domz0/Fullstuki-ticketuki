const $ = (selector) => document.querySelector(selector);

// datos que llegan de antes evento>entrada>pago
const eventoGuardado = localStorage.getItem("compraEvento");
const fechaGuardada = localStorage.getItem("compraFecha");
const recintoGuardado = localStorage.getItem("compraRecinto");
const areaGuardada = localStorage.getItem("compraArea");
const cantidadGuardada = localStorage.getItem("compraLinea");
const metodoPagoGuardado = localStorage.getItem("metodo_pago");
const totalGuardado = localStorage.getItem("total_pagado");

// //esto despues tiene que ser dinamico, por ahora asi noma
localStorage.setItem("orden", "TKI-2026-004821");
localStorage.setItem("codigo", "TKI-8F42-9C1D");
const ordenGuardada = localStorage.getItem("orden");
const codigoGuardado = localStorage.getItem("codigo");

// tirar a la pantalla los datos
$("#orden").textContent = ordenGuardada || "";
$("#codigo_acceso").textContent = codigoGuardado || "";
$("#evento").textContent = eventoGuardado || "";
$("#fecha_hora").textContent = fechaGuardada || "";
$("#recinto").textContent = recintoGuardado || "";
$("#area").textContent = areaGuardada || "";
$("#cantidad").textContent = cantidadGuardada || "";
$("#metodo_pago").textContent = metodoPagoGuardado || "";

// total
if (totalGuardado) {
  $("#total_pagado").textContent =
    "$" + Number(totalGuardado).toLocaleString("es-CL");
} else {
  $("#total_pagado").textContent = "";
}

// botones
$("#btnEntradas").addEventListener("click", () => {
  window.location.href = "../../cuenta/mis-entradas/mis-entradas.html";
});

$("#btnHome").addEventListener("click", () => {
  window.location.href = "../../index.html";
});
