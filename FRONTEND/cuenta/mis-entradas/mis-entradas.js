(() => {
  const entradas = [...document.querySelectorAll(".entrada")];
  const vacio = document.querySelector("[data-vacio]");

  const filtrar = (estado) => {
    entradas.forEach((entrada) => {
      entrada.hidden = entrada.dataset.estado !== estado;
    });

    vacio.hidden = entradas.some((entrada) => !entrada.hidden);
  };

  document.querySelectorAll("[data-filtro]").forEach((boton) => {
    boton.addEventListener("click", () => {
      document.querySelectorAll("[data-filtro]").forEach((otro) => {
        otro.classList.toggle("is-activo", otro === boton);
      });

      filtrar(boton.dataset.filtro);
    });
  });

  filtrar("proximas");
})();
