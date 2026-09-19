
(() => {
  const carpetaFrontend = new URL("../", document.currentScript.src);

  const cargar = () => {
    const contenedor = document.getElementById("footer");
    if (!contenedor) return;

    fetch(new URL("footer/footer.html", carpetaFrontend), { cache: "no-cache" })
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error("No se pudo cargar el footer: " + respuesta.status);
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

        contenedor.replaceChildren(plantilla.content);

        activarSuscripcion(contenedor);
        mantenerContactoAbierto(contenedor);
      })
      .catch((error) => console.error("Error al cargar el footer:", error));
  };

  // la validación del correo se hace aca
  function activarSuscripcion(contenedor) {
    const forma = contenedor.querySelector("[data-suscripcion]");
    const confirmacion = contenedor.querySelector("[data-confirmacion]");
    if (!forma || !confirmacion) return;

    const campo = forma.elements.correo;
    const error = forma.querySelector("[data-error]");

    // Un correo valido: algo, una @, dominio, punto y la extension
    const FORMATO = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    const revisar = (valor) => {
      if (valor === "") {
        return "Escribe tu correo para suscribirte.";
      }
      if (valor.includes(" ")) {
        return "El correo no puede llevar espacios.";
      }
      if (!valor.includes("@")) {
        return "Falta el signo @. Por ejemplo: nombre@correo.cl";
      }
      if (!FORMATO.test(valor)) {
        return "Revisa el correo: debe terminar en un dominio como correo.cl";
      }
      return "";
    };

    const mostrarError = (mensaje) => {
      error.textContent = mensaje;
      error.hidden = mensaje === "";
      campo.classList.toggle("pie__campo--error", mensaje !== "");
      campo.setAttribute("aria-invalid", mensaje !== "");
    };

    forma.addEventListener("submit", (evento) => {
      evento.preventDefault();

      const valor = campo.value.trim();
      const mensaje = revisar(valor);

      if (mensaje) {
        mostrarError(mensaje);
        campo.focus();
        return;
      }

      mostrarError("");
      confirmacion.querySelector("[data-correo]").textContent = valor;
      forma.hidden = true;
      confirmacion.hidden = false;
    });

    campo.addEventListener("input", () => {
      if (!error.hidden && revisar(campo.value.trim()) === "") {
        mostrarError("");
      }
    });
  }

  function mantenerContactoAbierto(contenedor) {
    const contacto = contenedor.querySelector("[data-contacto]");
    if (!contacto) return;

    const revisar = () => {
      if (window.innerWidth > 860) contacto.open = true;
    };

    revisar();
    window.addEventListener("resize", revisar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cargar);
  } else {
    cargar();
  }
})();

