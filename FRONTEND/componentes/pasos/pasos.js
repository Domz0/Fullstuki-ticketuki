/*
  El stepper es la barra de progreso del checkout, para ocuparlo se pone data-etapa en el <body> ("entradas", "pago" o "confirmacion") y pone <div id="pasos"></div>
  donde quiere la barra
  en movil son tres barritas "paso n de 3"
*/
(() => {
  const PASOS = [
    { id: "entradas", nombre: "Entradas" },
    { id: "pago", nombre: "Pago" },
    { id: "confirmacion", nombre: "Confirmación" },
  ];

  function cargar() {
    const contenedor = document.getElementById("pasos");
    if (!contenedor) return;

    let actual = 0;
    PASOS.forEach((paso, posicion) => {
      if (paso.id === document.body.dataset.etapa) {
        actual = posicion;
      }
    });

    const barra = document.createElement("nav");
    barra.className = "pasos";
    barra.setAttribute("aria-label", "Progreso de la compra");

    const resumen = document.createElement("p");
    resumen.className = "pasos__resumen";
    resumen.textContent = `Paso ${actual + 1} de ${PASOS.length}`;

    const lista = document.createElement("ol");
    lista.className = "pasos__lista";

    PASOS.forEach((paso, posicion) => {
      const item = document.createElement("li");
      item.className = "paso";
      if (posicion < actual) {
        item.classList.add("is-completo");
      } else {
        item.classList.remove("is-completo");
      }
      if (posicion === actual) {
        item.classList.add("is-activo");
      } else {
        item.classList.remove("is-activo");
      }
      if (posicion === actual) item.setAttribute("aria-current", "step");

      const numero = document.createElement("span");
      numero.className = "paso__numero";
      if (posicion < actual) {
        numero.textContent = "✓";
      } else {
        numero.textContent = String(posicion + 1);
      }
      numero.setAttribute("aria-hidden", "true");

      const nombre = document.createElement("span");
      nombre.className = "paso__nombre";
      nombre.textContent = paso.nombre;

      item.append(numero, nombre);
      lista.append(item);
    });

    barra.append(resumen, lista);
    contenedor.replaceChildren(barra);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cargar);
  } else {
    cargar();
  }
})();
