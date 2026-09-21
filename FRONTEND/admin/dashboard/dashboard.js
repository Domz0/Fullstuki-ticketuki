const $ = (selector) => document.querySelector(selector);

const sesionIniciada = localStorage.getItem("sesionIniciada");
const rol = localStorage.getItem("rol");

if (sesionIniciada !== "true" || rol !== "admin") {
  window.location.href = "../../cuenta/login/login.html";
}

$("#cerrarSesion").addEventListener("click", () => {
  localStorage.setItem("sesionIniciada", "false");
  localStorage.removeItem("rol");
  window.location.href = "../../index.html";
});

const menu = $("#lateral");
const velo = $("#velo");
const botonMenu = $("#abrirMenu");

const abrirMenu = () => {
  menu.classList.add("is-abierto");
  velo.hidden = false;
  botonMenu.setAttribute("aria-expanded", "true");
};

const cerrarMenu = () => {
  menu.classList.remove("is-abierto");
  velo.hidden = true;
  botonMenu.setAttribute("aria-expanded", "false");
};

botonMenu.addEventListener("click", abrirMenu);
velo.addEventListener("click", cerrarMenu);


const periodos = document.querySelectorAll(".periodo");

periodos.forEach((periodo) => {
  periodo.addEventListener("click", () => {
    periodos.forEach((otroPeriodo) => {
      otroPeriodo.classList.remove("is-activo");
      otroPeriodo.setAttribute("aria-pressed", "false");
    });
    periodo.classList.add("is-activo");
    periodo.setAttribute("aria-pressed", "true");
    $("#curvaSub").textContent = "Entradas vendidas por día · " + periodo.dataset.periodo;
  });
});
