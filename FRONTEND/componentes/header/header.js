
(() => {
  const carpetaFrontend = new URL("../../", document.currentScript.src);

  function cargar() {
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
            let atributo = "src";
            if (elemento.hasAttribute("href")) {
              atributo = "href";
            }
            const valor = elemento.getAttribute(atributo);
            if (!valor || valor.startsWith("#") || /^[a-z]+:/i.test(valor)) return;
            elemento.setAttribute(atributo, new URL(valor, carpetaFrontend).href);
          });


        const pagina = document.body.dataset.pagina || "inicio";
        const pestana = plantilla.content.querySelector(
          "#header_pagina_" + pagina
        );
        if (pestana) pestana.classList.add("is-activo");

        // leyendo primero ?categoria= en la url, sino <body data-categoria 
        const enlace = new URL(location.href).searchParams.get("categoria");
        const categoria = enlace || document.body.dataset.categoria || "todos";
        const chip = plantilla.content.querySelector(
          "#header_categoria_" + categoria
        );
        if (chip) chip.classList.add("is-activo");

        // Estado de la sesion. Manda localStorage("sesionIniciada"), que es lo que
        // escriben login.js y cuenta.js al entrar o salir. Si esa clave todavia no
        // existe (navegador limpio) se usa <body data-sesion> como respaldo.
        // Se elimina el bloque que no corresponde en vez de ocultarlo: el atributo
        // hidden no sirve aca porque .menu ya trae display:flex y le gana.
        const guardada = localStorage.getItem("sesionIniciada");
        let sesion = "invitado";
        if (guardada === "true") {
          sesion = "cliente";
        } else if (guardada === null && document.body.dataset.sesion) {
          sesion = document.body.dataset.sesion;
        }

        const menuInvitado = plantilla.content.querySelector("#header_invitado");
        const menuCliente = plantilla.content.querySelector("#header_cliente");
        if (sesion === "cliente") {
          menuInvitado.remove();
          menuCliente.hidden = false;
        } else {
          menuCliente.remove();
        }

        // Iniciales del usuario en el avatar. Van como texto, nunca como html.
        const avatar = plantilla.content.querySelector("#header_iniciales");
        if (avatar) {
          const nombre = localStorage.getItem("nombre") || "";
          const apellido = localStorage.getItem("apellido") || "";
          const iniciales = (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
          avatar.textContent = iniciales || "TK";
        }

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

