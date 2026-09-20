/*
  Paso 1 del checkout: elegir area.

  Toda la informacion de recintos y sectores sale de
  componentes/recinto/recinto.js, asi que esta pantalla no repite precios ni
  nombres: cambia el recinto y el mapa, el listado y los totales se rehacen solos.

  La pagina admite dos parametros en la url:
    ?recinto=estadio|teatro|arena|ferial
    ?fecha=14 nov|15 nov
*/
(() => {
  const MAXIMO = 6;
  const CANTIDAD_INICIAL = 2;
  const ESCALAS = [0.8, 1, 1.2, 1.4];

  const FECHAS = {
    "14 nov": { largo: "Sáb 14 nov, 20:00", corto: "Sáb 14 nov" },
    "15 nov": { largo: "Dom 15 nov, 19:00", corto: "Dom 15 nov" },
  };

  const { pesos, cargoPorServicio, buscarRecinto, RECINTOS } = window.Recinto;

  const parametros = new URLSearchParams(location.search);
  const fecha = FECHAS[parametros.get("fecha")] || FECHAS["14 nov"];

  const estado = {
    recinto: buscarRecinto(parametros.get("recinto")),
    sector: null,
    cantidad: CANTIDAD_INICIAL,
    escala: 1,
  };

  const lienzo = document.querySelector("[data-mapa]");
  const listaAreas = document.querySelector("[data-areas]");
  const grupoVariantes = document.querySelector("[data-variantes]");
  const barraCompra = document.querySelector("[data-compra]");
  const bloqueVacio = document.querySelector("[data-vacio]");
  const bloqueDetalle = document.querySelector("[data-detalle]");

  // El resumen vive dos veces (panel de escritorio y barra movil), por eso
  // siempre se escribe sobre todas las coincidencias.
  const escribir = (selector, valor) => {
    document.querySelectorAll(selector).forEach((nodo) => {
      nodo.textContent = valor;
    });
  };

  // ---------- Variantes de recinto ----------

  const dibujarVariantes = () => {
    grupoVariantes.textContent = "";

    Object.values(RECINTOS).forEach((recinto) => {
      const activo = recinto.id === estado.recinto.id;
      const boton = document.createElement("button");

      boton.type = "button";
      boton.className = "variante";
      boton.classList.toggle("is-activo", activo);
      boton.setAttribute("aria-pressed", String(activo));
      boton.textContent = recinto.etiqueta;
      boton.addEventListener("click", () => cambiarRecinto(recinto));

      grupoVariantes.append(boton);
    });
  };

  // ---------- Listado de áreas ----------

  const dibujarAreas = () => {
    listaAreas.textContent = "";

    estado.recinto.sectores.forEach((sector) => {
      const agotada = sector.estado === "agotada";
      const item = document.createElement("li");
      const caja = document.createElement(agotada ? "div" : "button");

      caja.className = "area";
      caja.classList.toggle("area--agotada", agotada);
      caja.dataset.area = sector.id;

      if (caja.tagName === "BUTTON") {
        caja.type = "button";
        caja.setAttribute("aria-label", `${sector.nombre}, ${pesos(sector.precio)}`);
        caja.addEventListener("click", () => elegirSector(sector));
      }

      const nombre = document.createElement("span");
      nombre.className = "area__nombre";
      nombre.textContent = sector.nombre;

      const precio = document.createElement("span");
      precio.className = "area__precio";
      precio.textContent = agotada ? "Agotada" : pesos(sector.precio);

      caja.append(nombre, precio);
      item.append(caja);
      listaAreas.append(item);
    });

    marcarAreas();
  };

  const marcarAreas = () => {
    const elegido = estado.sector ? estado.sector.id : "";

    listaAreas.querySelectorAll(".area").forEach((caja) => {
      caja.classList.toggle("is-activo", caja.dataset.area === elegido);
    });
  };

  // ---------- Mapa ----------

  const dibujarMapa = () => {
    window.Recinto.dibujarMapa(lienzo, estado.recinto, {
      escala: estado.escala,
      interactivo: true,
      seleccionado: estado.sector ? estado.sector.id : "",
      alSeleccionar: elegirSector,
    });
  };

  // ---------- Resumen ----------

  const pintarResumen = () => {
    const sector = estado.sector;

    // Con un área elegida, el escritorio cambia el listado por el resumen.
    document.body.classList.toggle("con-seleccion", Boolean(sector));

    bloqueVacio.hidden = Boolean(sector);
    bloqueDetalle.hidden = !sector;
    barraCompra.hidden = !sector;

    if (!sector) return;

    const subtotal = sector.precio * estado.cantidad;
    const cargo = cargoPorServicio(subtotal);

    escribir("[data-nombre]", sector.nombre);
    escribir("[data-unidad]", `${pesos(sector.precio)} por entrada`);
    escribir("[data-cantidad]", estado.cantidad);
    escribir("[data-linea]", `${estado.cantidad} × entrada`);
    escribir("[data-subtotal]", pesos(subtotal));
    escribir("[data-cargo]", pesos(cargo));
    escribir("[data-total]", pesos(subtotal + cargo));

    document.querySelectorAll("[data-paso]").forEach((boton) => {
      const paso = Number(boton.dataset.paso);
      boton.disabled =
        paso < 0 ? estado.cantidad <= 1 : estado.cantidad >= MAXIMO;
    });
  };

  const pintarCabecera = () => {
    escribir("[data-detalle-largo]", `${fecha.largo} · ${estado.recinto.nombre}`);
    escribir("[data-detalle-corto]", `${estado.recinto.nombre} · ${fecha.corto}`);
  };

  // ---------- Acciones ----------

  function elegirSector(sector) {
    estado.sector = sector;
    dibujarMapa();
    marcarAreas();
    pintarResumen();
  }

  function cambiarRecinto(recinto) {
    if (recinto.id === estado.recinto.id) return;

    estado.recinto = recinto;
    estado.sector = null;
    estado.cantidad = CANTIDAD_INICIAL;

    dibujarVariantes();
    pintarCabecera();
    dibujarMapa();
    dibujarAreas();
    pintarResumen();
  }

  document.addEventListener("click", (evento) => {
    const paso = evento.target.closest("[data-paso]");
    if (!paso || !estado.sector) return;

    const siguiente = estado.cantidad + Number(paso.dataset.paso);
    if (siguiente < 1 || siguiente > MAXIMO) return;

    estado.cantidad = siguiente;
    pintarResumen();
  });

  document.querySelectorAll("[data-zoom]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const posicion = ESCALAS.indexOf(estado.escala) + Number(boton.dataset.zoom);
      if (posicion < 0 || posicion >= ESCALAS.length) return;

      estado.escala = ESCALAS[posicion];
      dibujarMapa();

      document.querySelectorAll("[data-zoom]").forEach((otro) => {
        const destino = ESCALAS.indexOf(estado.escala) + Number(otro.dataset.zoom);
        otro.disabled = destino < 0 || destino >= ESCALAS.length;
      });
    });
  });

  dibujarVariantes();
  pintarCabecera();
  dibujarMapa();
  dibujarAreas();
  pintarResumen();
})();
