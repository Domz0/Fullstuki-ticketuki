/*
  Paso 1: elegir area.
  El recinto lo define el evento y llega en la url (?recinto=...&fecha=...).
*/
(() => {
  const MAXIMO = 6;
  const ESCALA_MINIMA = 0.8;
  const ESCALA_MAXIMA = 1.4;

  const FECHAS = {
    "14 nov": { largo: "Sáb 14 nov, 20:00", corto: "Sáb 14 nov" },
    "15 nov": { largo: "Dom 15 nov, 19:00", corto: "Dom 15 nov" },
  };

  const { RECINTOS, pesos, cargoPorServicio, dibujarMapa } = window.Recinto;

  const url = new URLSearchParams(location.search);
  const recinto = RECINTOS[url.get("recinto")] || RECINTOS.estadio;
  const fecha = FECHAS[url.get("fecha")] || FECHAS["14 nov"];

  let sector = null;
  let cantidad = 1;
  let escala = 1;

  const lienzo = document.querySelector("[data-mapa]");
  const listaAreas = document.querySelector("[data-areas]");

  // Varios datos salen dos veces: en el panel de escritorio y en la barra movil.
  const escribir = (selector, valor) => {
    document.querySelectorAll(selector).forEach((nodo) => {
      nodo.textContent = valor;
    });
  };

  const mostrar = (selector, visible) => {
    document.querySelectorAll(selector).forEach((nodo) => {
      nodo.hidden = !visible;
    });
  };

  const apagar = (selector, apagado) => {
    document.querySelectorAll(selector).forEach((nodo) => {
      nodo.disabled = apagado;
    });
  };

  const crearTexto = (clase, texto) => {
    const span = document.createElement("span");
    span.className = clase;
    span.textContent = texto;
    return span;
  };

  // ---------- dibujar ----------

  const pintarCabecera = () => {
    escribir("[data-detalle-largo]", `${fecha.largo} · ${recinto.nombre}`);
    escribir("[data-detalle-corto]", `${recinto.nombre} · ${fecha.corto}`);
  };

  const pintarMapa = () => {
    dibujarMapa(lienzo, recinto, {
      escala,
      interactivo: true,
      seleccionado: sector ? sector.id : "",
      alSeleccionar: elegir,
    });
  };

  const crearArea = (area) => {
    const agotada = area.estado === "agotada";
    const caja = document.createElement(agotada ? "div" : "button");

    caja.className = agotada ? "area area--agotada" : "area";
    if (sector && sector.id === area.id) caja.classList.add("is-activo");

    if (!agotada) {
      caja.type = "button";
      caja.setAttribute("aria-label", `${area.nombre}, ${pesos(area.precio)}`);
      caja.addEventListener("click", () => elegir(area));
    }

    caja.append(
      crearTexto("area__nombre", area.nombre),
      crearTexto("area__precio", agotada ? "Agotada" : pesos(area.precio))
    );

    const item = document.createElement("li");
    item.append(caja);
    return item;
  };

  const pintarAreas = () => {
    listaAreas.replaceChildren(...recinto.sectores.map(crearArea));
  };

  const pintarResumen = () => {
    document.body.classList.toggle("con-seleccion", Boolean(sector));
    mostrar("[data-vacio]", !sector);
    mostrar("[data-detalle]", Boolean(sector));
    mostrar("[data-compra]", Boolean(sector));

    if (!sector) return;

    const subtotal = sector.precio * cantidad;
    const cargo = cargoPorServicio(subtotal);

    escribir("[data-nombre]", sector.nombre);
    escribir("[data-unidad]", `${pesos(sector.precio)} por entrada`);
    escribir("[data-cantidad]", cantidad);
    escribir("[data-linea]", `${cantidad} × entrada`);
    escribir("[data-subtotal]", pesos(subtotal));
    escribir("[data-cargo]", pesos(cargo));
    escribir("[data-total]", pesos(subtotal + cargo));

    apagar('[data-paso="-1"]', cantidad <= 1);
    apagar('[data-paso="1"]', cantidad >= MAXIMO);
  };

  // ---------- acciones ----------

  function elegir(area) {
    sector = area;
    pintarMapa();
    pintarAreas();
    pintarResumen();
  }

  document.querySelectorAll("[data-paso]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const nueva = cantidad + Number(boton.dataset.paso);
      cantidad = Math.min(MAXIMO, Math.max(1, nueva));
      pintarResumen();
    });
  });

  document.querySelectorAll("[data-zoom]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const nueva = escala + Number(boton.dataset.zoom) * 0.2;
      escala = Math.min(ESCALA_MAXIMA, Math.max(ESCALA_MINIMA, nueva));

      pintarMapa();
      apagar('[data-zoom="-1"]', escala <= ESCALA_MINIMA);
      apagar('[data-zoom="1"]', escala >= ESCALA_MAXIMA);
    });
  });

  pintarCabecera();
  pintarMapa();
  pintarAreas();
  pintarResumen();
})();
