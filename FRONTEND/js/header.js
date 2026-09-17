// Desde FRONTEND/js/header.js, subir una carpeta lleva a FRONTEND/.
const carpetaFrontend = new URL("../", document.currentScript.src);

fetch(new URL("header/header.html", carpetaFrontend))
  .then((respuesta) => {
    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el header: " + respuesta.status);
    }
    return respuesta.text();
  })
  .then((contenido) => {
    const header = document.getElementById("header");
    header.innerHTML = contenido;

    // Los enlaces del header parten desde FRONTEND, incluso en páginas anidadas.
    header.querySelectorAll("a[href]").forEach((enlace) => {
      enlace.href = new URL(enlace.getAttribute("href"), carpetaFrontend).href;
    });
  })
  .catch((error) => console.error("Error al cargar el header:", error));
