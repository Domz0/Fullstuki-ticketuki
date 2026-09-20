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
  const categoria = CATEGORIAS[pedida] ? pedida : "musica";

  const elegido = { subcategoria: "", ciudad: "", plazo: "", recinto: "" };

  const lista = document.querySelector("[data-lista]");
  const vacio = document.querySelector("[data-vacio]");
  const panel = document.querySelector("[data-panel]");
  const campoBusqueda = document.querySelector("[data-busqueda]");
  const selectOrden = document.querySelector("[data-orden]");

  // ---------- Categoría abierta ----------

  document.querySelectorAll(".resultado").forEach((evento) => {
    if (evento.dataset.categoria !== categoria) evento.remove();
  });
  const resultados = [...document.querySelectorAll(".resultado")];

  document.title = `Ticketuki · ${CATEGORIAS[categoria]}`;
  document.querySelector(".categoria__titulo").textContent = CATEGORIAS[categoria];
  document.body.dataset.categoria = categoria;
  document.querySelectorAll("[data-categoria-nombre]").forEach((nodo) => {
    nodo.textContent = CATEGORIAS[categoria];
  });

  // ---------- Filtros ----------

  // valores distintos que aparecen en los eventos de la categoria
  const valoresDe = (grupo) =>
    [...new Set(resultados.map((evento) => evento.dataset[grupo]))].sort((a, b) =>
      a.localeCompare(b, "es")
    );

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
  const etiquetaDe = (grupo, valor) => {
    if (!valor) return NOMBRES[grupo];
    if (grupo === "plazo") return PLAZOS[valor];
    return valor;
  };

  // ---------- Filtrar y ordenar ----------

  const coincide = (evento) => {
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

  const ordenar = () => {
    const porPrecio = selectOrden.value === "precio";

    [...resultados]
      .sort((a, b) =>
        porPrecio
          ? Number(a.dataset.precio) - Number(b.dataset.precio)
          : Number(a.dataset.plazo) - Number(b.dataset.plazo)
      )
      .forEach((evento) => lista.insertBefore(evento, vacio));
  };

  const actualizar = () => {
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
      nodo.textContent = cuantos === 1 ? palabra : palabra + "s";
    });

    // la cabecera nombra la ciudad solo si todos los eventos a la vista son de la misma, si no, el listado abarca todo Chile
    const ciudades = new Set(visibles.map((evento) => evento.dataset.ciudad));
    document.querySelector("[data-ciudad]").textContent =
      ciudades.size === 1 ? [...ciudades][0] : "todo Chile";

    const activos = Object.values(elegido).filter(Boolean).length;
    const chipFiltros = document.querySelector(".chips__chip--filtros");
    chipFiltros.classList.toggle("is-activo", activos > 0);
    chipFiltros.querySelector("[data-activos]").textContent = activos;

    document.querySelectorAll("[data-resumen]").forEach((chip) => {
      const grupo = chip.dataset.resumen;
      chip.textContent = etiquetaDe(grupo, elegido[grupo]);
      chip.classList.toggle("is-activo", Boolean(elegido[grupo]));
    });
  };

  // deja los selects y los chips del panel igual que el objeto elegido
  const sincronizar = () => {
    document.querySelectorAll(".panel__opciones").forEach((contenedor) => {
      const grupo = contenedor.dataset.grupo;
      contenedor.querySelectorAll(".panel__opcion").forEach((opcion) => {
        opcion.classList.toggle("is-activo", elegido[grupo] === opcion.value);
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
      elegido[grupo] = elegido[grupo] === opcion.value ? "" : opcion.value;
      sincronizar();
    });
  });

  document.querySelectorAll("[data-limpiar]").forEach((boton) => {
    boton.addEventListener("click", () => {
      Object.keys(elegido).forEach((grupo) => {
        elegido[grupo] = "";
      });
      campoBusqueda.value = "";
      sincronizar();
    });
  });

  campoBusqueda.addEventListener("input", actualizar);
  selectOrden.addEventListener("change", actualizar);

  // ---------- Mobile ----------

  const abrirPanel = () => {
    panel.hidden = false;
    document.body.classList.add("sin-scroll");
  };

  const cerrarPanel = () => {
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
