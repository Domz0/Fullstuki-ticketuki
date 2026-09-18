fetch(new URL("../footer/footer.html", document.currentScript.src))
  .then((respuesta) => respuesta.text())
  .then((contenido) => {
    document.getElementById("footer").innerHTML = contenido;
  });
