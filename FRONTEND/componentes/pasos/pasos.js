/*
  Componente pasos: la barra de progreso del checkout.

  La pagina declara en que paso va con data-paso en el <body>
  ("entradas", "pago" o "confirmacion") y pone <div id="pasos"></div>
  donde quiere la barra. Los pasos anteriores quedan marcados con un check.

  En movil la lista se convierte en tres barritas mas el texto "Paso N de 3",
  igual que la maqueta 1w.
*/
(() => {
  const PASOS = [
    { id: "entradas", nombre: "Entradas" },
    { id: "pago", nombre: "Pago" },
    { id: "confirmacion", nombre: "Confirmación" },
  ];

  const cargar = () => {
    const contenedor = document.getElementById("pasos");
    if (!contenedor) return;

    const pedido = PASOS.findIndex((paso) => paso.id === document.body.dataset.paso);
    const actual = pedido === -1 ? 0 : pedido;

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
      item.classList.toggle("is-completo", posicion < actual);
      item.classList.toggle("is-activo", posicion === actual);
      if (posicion === actual) item.setAttribute("aria-current", "step");

      const numero = document.createElement("span");
      numero.className = "paso__numero";
      numero.textContent = posicion < actual ? "✓" : String(posicion + 1);
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
