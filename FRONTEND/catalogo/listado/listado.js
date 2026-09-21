(() => {
  const CATEGORIAS = {
    musica: "Música",
    artes: "Artes y Teatro",
    deportes: "Deportes",
    ferias: "Ferias & Expos",
  };

  // nombre que muestra cada filtro cuando no hay nada elegido
  const NOMBRES = {
    subcategoria: "Subcategoría",
    ciudad: "Ciudad",
    plazo: "Fecha",
    recinto: "Recinto",
  };

  const GRUPOS_AUTOMATICOS = ["subcategoria", "ciudad", "recinto"];

  // etiquetas del grupo "plazo"; antes se leian del <select> que ya no existe
  const PLAZOS = {
    "1": "Esta semana",
    "2": "Este mes",
    "3": "Próximos 3 meses",
  };

  const pedida = new URLSearchParams(location.search).get("categoria");
  let categoria = "musica";
  if (CATEGORIAS[pedida]) {
    categoria = pedida;
  }

  const elegido = { subcategoria: "", ciudad: "", plazo: "", recinto: "" };

  const lista = document.querySelector("#listado_lista");
  const vacio = document.querySelector("#listado_vacio");
  const panel = document.querySelector("#listado_panel");
  const campoBusqueda = document.querySelector("#listado_busqueda");
  const selectOrden = document.querySelector("#listado_orden");

  // ---------- Categoría abierta ----------

  document.querySelectorAll(".resultado").forEach((evento) => {
    if (evento.dataset.categoria !== categoria) evento.remove();
  });
  const resultados = [];
  document.querySelectorAll(".resultado").forEach((evento) => {
    resultados.push(evento);
  });

  document.title = `Ticketuki · ${CATEGORIAS[categoria]}`;
  document.querySelector("#categoria__titulo").textContent = CATEGORIAS[categoria];
  document.body.dataset.categoria = categoria;
  document.querySelectorAll("[data-categoria-nombre]").forEach((nodo) => {
    nodo.textContent = CATEGORIAS[categoria];
  });

  // ---------- Filtros ----------

  // valores distintos que aparecen en los eventos de la categoria
  function valoresDe(grupo) {
    const valores = [];
    resultados.forEach((evento) => {
      const valor = evento.dataset[grupo];
      if (!valores.includes(valor)) {
        valores.push(valor);
      }
    });
    valores.sort((a, b) => a.localeCompare(b, "es"));
    return valores;
  }

  GRUPOS_AUTOMATICOS.forEach((grupo) => {
    const valores = valoresDe(grupo);

    document.querySelectorAll(`.panel__opciones[data-grupo="${grupo}"]`).forEach((cont) => {
      valores.forEach((valor) => {
        const opcion = document.createElement("button");
        opcion.type = "button";
        opcion.className = "panel__opcion";
        opcion.value = valor;
        opcion.textContent = valor;
        cont.append(opcion);
      });
    });
  });

  // texto que muestra un chip resumen lo elegido, o el nombre del grupo
  function etiquetaDe(grupo, valor) {
    if (!valor) return NOMBRES[grupo];
    if (grupo === "plazo") return PLAZOS[valor];
    return valor;
  };

  // ---------- Filtrar y ordenar ----------

  function coincide(evento) {
    const texto = (campoBusqueda.value || "").trim().toLowerCase();
    const nombre = evento.querySelector(".resultado__nombre").textContent.toLowerCase();

    if (texto && !nombre.includes(texto)) return false;
    if (elegido.subcategoria && evento.dataset.subcategoria !== elegido.subcategoria) return false;
    if (elegido.ciudad && evento.dataset.ciudad !== elegido.ciudad) return false;
    if (elegido.recinto && evento.dataset.recinto !== elegido.recinto) return false;

    // Los plazos son acumulativos: "este mes" también incluye "esta semana".
    if (elegido.plazo && Number(evento.dataset.plazo) > Number(elegido.plazo)) return false;

    return true;
  };

  function ordenar() {
    const porPrecio = selectOrden.value === "precio";

    const ordenados = resultados.slice();
    ordenados.sort((a, b) => {
      if (porPrecio) {
        return Number(a.dataset.precio) - Number(b.dataset.precio);
      }
      return Number(a.dataset.plazo) - Number(b.dataset.plazo);
    });
    ordenados.forEach((evento) => {
      lista.insertBefore(evento, vacio);
    });
  };

  function actualizar() {
    const visibles = [];

    resultados.forEach((evento) => {
      const pasa = coincide(evento);
      evento.hidden = !pasa;
      if (pasa) visibles.push(evento);
    });

    ordenar();

    const cuantos = visibles.length;
    vacio.hidden = cuantos > 0;

    document.querySelectorAll("[data-conteo]").forEach((nodo) => {
      nodo.textContent = cuantos;
    });

    // 1 evento o 2 eventos
    document.querySelectorAll("[data-plural]").forEach((nodo) => {
      const palabra = nodo.dataset.plural;
      if (cuantos === 1) {
        nodo.textContent = palabra;
      } else {
        nodo.textContent = palabra + "s";
      }
    });

    // la cabecera nombra la ciudad solo si todos los eventos a la vista son de la misma, si no, el listado abarca todo Chile
    const ciudades = [];
    visibles.forEach((evento) => {
      if (!ciudades.includes(evento.dataset.ciudad)) {
        ciudades.push(evento.dataset.ciudad);
      }
    });
    const textoCiudad = document.querySelector("#listado_ciudad");
    textoCiudad.textContent = "todo Chile";
    if (ciudades.length === 1) {
      textoCiudad.textContent = ciudades[0];
    }

    let activos = 0;
    const grupos = ["subcategoria", "ciudad", "plazo", "recinto"];
    grupos.forEach((grupo) => {
      if (elegido[grupo] !== "") {
        activos = activos + 1;
      }
    });
    const chipFiltros = document.querySelector("#chips__chip__filtros");
    if (activos > 0) {
      chipFiltros.classList.add("is-activo");
    } else {
      chipFiltros.classList.remove("is-activo");
    }
    chipFiltros.querySelector("#listado_activos").textContent = activos;

    document.querySelectorAll("[data-resumen]").forEach((chip) => {
      const grupo = chip.dataset.resumen;
      chip.textContent = etiquetaDe(grupo, elegido[grupo]);
      if (Boolean(elegido[grupo])) {
        chip.classList.add("is-activo");
      } else {
        chip.classList.remove("is-activo");
      }
    });
  };

  // deja los selects y los chips del panel igual que el objeto elegido
  function sincronizar() {
    document.querySelectorAll(".panel__opciones").forEach((contenedor) => {
      const grupo = contenedor.dataset.grupo;
      contenedor.querySelectorAll(".panel__opcion").forEach((opcion) => {
        if (elegido[grupo] === opcion.value) {
          opcion.classList.add("is-activo");
        } else {
          opcion.classList.remove("is-activo");
        }
      });
    });

    actualizar();
  };

  // ---------- Eventos ----------

  document.querySelectorAll(".panel__opciones").forEach((contenedor) => {
    contenedor.addEventListener("click", (evento) => {
      const opcion = evento.target.closest(".panel__opcion");
      if (!opcion) return;

      const grupo = contenedor.dataset.grupo;
      // volver a tocar la opción elegida la desmarca
      if (elegido[grupo] === opcion.value) {
        elegido[grupo] = "";
      } else {
        elegido[grupo] = opcion.value;
      }
      sincronizar();
    });
  });

  document.querySelectorAll("[data-limpiar]").forEach((boton) => {
    boton.addEventListener("click", () => {
      ["subcategoria", "ciudad", "plazo", "recinto"].forEach((grupo) => {
        elegido[grupo] = "";
      });
      campoBusqueda.value = "";
      sincronizar();
    });
  });

  campoBusqueda.addEventListener("input", actualizar);
  selectOrden.addEventListener("change", actualizar);

  // ---------- Mobile ----------

  function abrirPanel() {
    panel.hidden = false;
    document.body.classList.add("sin-scroll");
  };

  function cerrarPanel() {
    panel.hidden = true;
    document.body.classList.remove("sin-scroll");
  };

  document.querySelectorAll("[data-abre-panel]").forEach((boton) => {
    boton.addEventListener("click", abrirPanel);
  });

  document.querySelectorAll("[data-cierra-panel]").forEach((boton) => {
    boton.addEventListener("click", cerrarPanel);
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !panel.hidden) cerrarPanel();
  });

  sincronizar();
})();
