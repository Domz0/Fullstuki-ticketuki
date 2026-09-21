(() => {
  const carpetaFrontend = new URL("../../", document.currentScript.src);

  function cargar() {
    const contenedor = document.getElementById("convenios");
    if (!contenedor) return;

    fetch(new URL("componentes/convenios/convenios.html", carpetaFrontend), { cache: "no-cache" })
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error("No se pudo cargar los convenios: " + respuesta.status);
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

        contenedor.replaceChildren(plantilla.content);
        activarCarrusel(contenedor);
      })
      .catch((error) => console.error("Error al cargar los convenios:", error));
  };

  function activarCarrusel(contenedor) {
    const pista = contenedor.querySelector("#convenios_pista");
    const puntos = contenedor.querySelector("#convenios_puntos");
    if (!pista) return;

    const convenios = [...pista.querySelectorAll(".convenio")];
    let actual = 0;

    // Con un solo convenio el carrusel no tiene a dónde ir.
    if (convenios.length < 2) {
      puntos.hidden = true;
      return;
    }

    convenios.forEach((convenio, indice) => {
      const punto = document.createElement("button");
      punto.type = "button";
      punto.className = "carrusel__punto";
      punto.setAttribute("role", "tab");
      punto.setAttribute("aria-label", `Convenio ${indice + 1}`);
      punto.addEventListener("click", () => ir(indice));
      puntos.append(punto);
    });

    const DURACION = 350;
    let animacion = null;
    let respaldo = null;

    function desplazar(destino) {
      if (animacion) cancelAnimationFrame(animacion);
      clearTimeout(respaldo);

      const inicio = pista.scrollLeft;
      const distancia = destino - inicio;
      if (distancia === 0) return;

      const partida = performance.now();
      pista.style.scrollSnapType = "none";

      function terminar() {
        if (animacion) cancelAnimationFrame(animacion);
        clearTimeout(respaldo);
        animacion = null;
        respaldo = null;
        pista.scrollLeft = destino;
        pista.style.scrollSnapType = "";

        actual = Math.round(destino / pista.clientWidth);
        pintar();
      };

      respaldo = setTimeout(terminar, DURACION + 100);

      function paso(ahora) {
        const avance = Math.min((ahora - partida) / DURACION, 1);
        // Arranca y termina despacio.
        let suave;
        if (avance < 0.5) {
          suave = 2 * avance * avance;
        } else {
          suave = 1 - Math.pow(-2 * avance + 2, 2) / 2;
        }

        pista.scrollLeft = inicio + distancia * suave;

        if (avance < 1) {
          animacion = requestAnimationFrame(paso);
        } else {
          terminar();
        }
      };

      animacion = requestAnimationFrame(paso);
    };

    function ir(indice) {
      const destino = Math.min(Math.max(indice, 0), convenios.length - 1);
      desplazar(destino * pista.clientWidth);
    };

    function pintar() {
      [...puntos.children].forEach((punto, indice) => {
        const activo = indice === actual;
        if (activo) {
          punto.classList.add("is-activo");
        } else {
          punto.classList.remove("is-activo");
        }
        punto.setAttribute("aria-selected", activo);
      });
    };

    pista.addEventListener("scroll", () => {
      const visible = Math.round(pista.scrollLeft / pista.clientWidth);
      if (visible !== actual) {
        actual = visible;
        pintar();
      }
    });

    pista.addEventListener("keydown", (evento) => {
      if (evento.key === "ArrowRight") ir(actual + 1);
      if (evento.key === "ArrowLeft") ir(actual - 1);
    });

    window.addEventListener("resize", () => {
      pista.scrollLeft = actual * pista.clientWidth;
    });

    pintar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cargar);
  } else {
    cargar();
  }
})();
