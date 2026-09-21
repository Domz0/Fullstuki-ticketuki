const sesionIniciada = localStorage.getItem("sesionIniciada");
if (sesionIniciada !== "true") {
  window.location.href = "../login/login.html";
} //si no estai logueado te fuiste al lobby

(() => {
  const entradas = document.querySelectorAll(".entrada");
  const vacio = document.querySelector("#mis_entradas_vacio");

  function filtrar(estado) {
    entradas.forEach((entrada) => {
      entrada.hidden = entrada.dataset.estado !== estado;
    });

    let hayEntradas = false;
    entradas.forEach((entrada) => {
      if (!entrada.hidden) {
        hayEntradas = true;
      }
    });
    vacio.hidden = hayEntradas;
  }

  document.querySelectorAll("[data-filtro]").forEach((boton) => {
    boton.addEventListener("click", () => {
      document.querySelectorAll("[data-filtro]").forEach((otro) => {
        otro.classList.remove("is-activo");
      });

      boton.classList.add("is-activo");
      filtrar(boton.dataset.filtro);
    });
  });

  filtrar("proximas");
})();
