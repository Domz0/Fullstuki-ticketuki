
(() => {
  const carpetaFrontend = new URL("../../", document.currentScript.src);

  function cargar() {
    const contenedor = document.getElementById("footer");
    if (!contenedor) return;

    fetch(new URL("componentes/footer/footer.html", carpetaFrontend), { cache: "no-cache" })
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
            let atributo = "src";
            if (elemento.hasAttribute("href")) {
              atributo = "href";
            }
            const valor = elemento.getAttribute(atributo);
            if (!valor || valor.startsWith("#") || /^[a-z]+:/i.test(valor)) return;
            elemento.setAttribute(atributo, new URL(valor, carpetaFrontend).href);
          });

        contenedor.replaceChildren(plantilla.content);

        mantenerContactoAbierto(contenedor);
      })
      .catch((error) => console.error("Error al cargar el footer:", error));
  };

  function mantenerContactoAbierto(contenedor) {
    const contacto = contenedor.querySelector("#footer_contacto");
    if (!contacto) return;

    function revisar() {
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

