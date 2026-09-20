// Paso 1 del checkout: elegir area.
// El recinto lo define el evento y llega en la url:
//   entradas.html?recinto=estadio&fecha=14 nov

const $ = (selector) => document.querySelector(selector);

const MAXIMO = 6;
const EVENTO = "Festival de rock en vivo";

const FECHAS = {
  "14 nov": { largo: "Sáb 14 nov, 20:00", corto: "Sáb 14 nov" },
  "15 nov": { largo: "Dom 15 nov, 19:00", corto: "Dom 15 nov" },
};

// Atajos a lo que dejo componentes/recinto/recinto.js
const RECINTOS = window.Recinto.RECINTOS;
const pesos = window.Recinto.pesos;

const url = new URLSearchParams(location.search);
const recinto = RECINTOS[url.get("recinto")] || RECINTOS.estadio;
const fecha = FECHAS[url.get("fecha")] || FECHAS["14 nov"];

// Lo que el usuario va eligiendo
let sector = null;
let cantidad = 1;

// ---------- el mapa ----------

const pintarMapa = () => {
  window.Recinto.dibujarMapa($("[data-mapa]"), recinto, sector);

  document.querySelectorAll("button.mapa__sector").forEach((caja) => {
    caja.addEventListener("click", () => {
      elegir(caja.dataset.sector);
    });
  });
};

// ---------- el listado de areas ----------

const pintarAreas = () => {
  let html = "";

  recinto.sectores.forEach((area) => {
    if (area.estado === "agotada") {
      html += `
        <li>
          <div class="area area--agotada">
            <span class="area__nombre">${area.nombre}</span>
            <span class="area__precio">Agotada</span>
          </div>
        </li>`;
      return;
    }

    let clases = "area";
    if (sector && sector.id === area.id) clases = "area is-activo";

    html += `
      <li>
        <button type="button" class="${clases}" data-area="${area.id}">
          <span class="area__nombre">${area.nombre}</span>
          <span class="area__precio">${pesos(area.precio)}</span>
        </button>
      </li>`;
  });

  $("[data-areas]").innerHTML = html;

  document.querySelectorAll("[data-area]").forEach((boton) => {
    boton.addEventListener("click", () => {
      elegir(boton.dataset.area);
    });
  });
};

// ---------- el resumen ----------

const pintarResumen = () => {
  if (sector === null) {
    document.body.classList.remove("con-seleccion");
    $("[data-vacio]").hidden = false;
    $("[data-detalle]").hidden = true;
    return;
  }

  document.body.classList.add("con-seleccion");
  $("[data-vacio]").hidden = true;
  $("[data-detalle]").hidden = false;

  const subtotal = sector.precio * cantidad;
  const cargo = window.Recinto.cargoPorServicio(subtotal);

  $("[data-nombre]").textContent = sector.nombre;
  $("[data-unidad]").textContent = `${pesos(sector.precio)} por entrada`;
  $("[data-cantidad]").textContent = cantidad;
  $("[data-linea]").textContent = `${cantidad} × entrada`;
  $("[data-subtotal]").textContent = pesos(subtotal);
  $("[data-cargo]").textContent = pesos(cargo);
  $("[data-total]").textContent = pesos(subtotal + cargo);

  $('[data-paso="-1"]').disabled = cantidad === 1;
  $('[data-paso="1"]').disabled = cantidad === MAXIMO;

  guardarCompra(subtotal, cargo);
};

// La pantalla de pago lee estos datos para mostrar la misma compra.
const guardarCompra = (subtotal, cargo) => {
  localStorage.setItem("compraEvento", EVENTO);
  localStorage.setItem("compraFecha", fecha.largo);
  localStorage.setItem("compraRecinto", recinto.nombre);
  localStorage.setItem("compraArea", sector.nombre);
  localStorage.setItem("compraLinea", `${cantidad} × entrada`);
  localStorage.setItem("compraSubtotal", pesos(subtotal));
  localStorage.setItem("compraCargo", pesos(cargo));
  localStorage.setItem("compraTotal", pesos(subtotal + cargo));
};

// ---------- elegir un area ----------

const elegir = (idArea) => {
  sector = recinto.sectores.find((area) => area.id === idArea);
  pintarMapa();
  pintarAreas();
  pintarResumen();
};

// ---------- botones - y + de la cantidad ----------

document.querySelectorAll("[data-paso]").forEach((boton) => {
  boton.addEventListener("click", () => {
    cantidad = cantidad + Number(boton.dataset.paso);

    if (cantidad < 1) cantidad = 1;
    if (cantidad > MAXIMO) cantidad = MAXIMO;

    pintarResumen();
  });
});

// ---------- al abrir la pagina ----------

$("[data-evento]").textContent = EVENTO;
$("[data-detalle-largo]").textContent = `${fecha.largo} · ${recinto.nombre}`;
$("[data-detalle-corto]").textContent = `${recinto.nombre} · ${fecha.corto}`;
pintarMapa();
pintarAreas();
pintarResumen();
