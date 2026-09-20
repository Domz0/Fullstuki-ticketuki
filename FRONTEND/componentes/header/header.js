
(() => {
  const carpetaFrontend = new URL("../../", document.currentScript.src);

  const cargar = () => {
    const contenedor = document.getElementById("header");
    if (!contenedor) return;

    fetch(new URL("componentes/header/header.html", carpetaFrontend), { cache: "no-cache" })
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error("No se pudo cargar el header: " + respuesta.status);
        }
        return respuesta.text();
      })
      .then((contenido) => {

        const plantilla = document.createElement("template");
        plantilla.innerHTML = contenido;


        plantilla.content
          .querySelectorAll("a[href], link[href], img[src]")
          .forEach((elemento) => {
            const atributo = elemento.hasAttribute("href") ? "href" : "src";
            const valor = elemento.getAttribute(atributo);
            if (!valor || valor.startsWith("#") || /^[a-z]+:/i.test(valor)) return;
            elemento.setAttribute(atributo, new URL(valor, carpetaFrontend).href);
          });


        const pagina = document.body.dataset.pagina || "inicio";
        const pestana = plantilla.content.querySelector(
          `.barra-movil__item[data-pagina="${pagina}"]`
        );
        if (pestana) pestana.classList.add("is-activo");

        // leyendo primero ?categoria= en la url, sino <body data-categoria 
        const enlace = new URL(location.href).searchParams.get("categoria");
        const categoria = enlace || document.body.dataset.categoria || "todos";
        const chip = plantilla.content.querySelector(
          `.categorias__chip[data-categoria="${categoria}"]`
        );
        if (chip) chip.classList.add("is-activo");

        // Estado de la sesion: la pagina lo declara con <body data-sesion="cliente">.
        // Por defecto es "invitado". Reemplaza a los antiguos header1/header2.
        // Se elimina el bloque que no corresponde en vez de ocultarlo: el atributo
        // hidden no sirve aca porque .menu ya trae display:flex y le gana.
        const sesion = document.body.dataset.sesion || "invitado";
        plantilla.content.querySelectorAll(".menu[data-sesion]").forEach((bloque) => {
          if (bloque.dataset.sesion !== sesion) bloque.remove();
        });

        contenedor.replaceChildren(plantilla.content);
      })
      .catch((error) => console.error("Error al cargar el header:", error));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cargar);
  } else {
    cargar();
  }
})();

