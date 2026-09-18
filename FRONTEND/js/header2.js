fetch(new URL("../header/header2.html", document.currentScript.src))
  .then((respuesta) => respuesta.text())
  .then((contenido) => {
    document.getElementById("header").innerHTML = contenido;
  });
