const carpetaFooter = new URL("../footer/", document.currentScript.src);

fetch(new URL("footer.html", carpetaFooter)) //obj y ubi
  .then((respuesta) => respuesta.text()) //pasa a text
  .then((contenido) => {
    const footer = document.getElementById("footer"); //busca donde lo llaman en el html
    footer.innerHTML = contenido;

    footer.querySelectorAll("img").forEach((imagen) => {
      //corrige la direccion de las img
      imagen.src = new URL(imagen.getAttribute("src"), carpetaFooter).href;
    });
  });
