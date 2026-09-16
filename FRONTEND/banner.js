fetch("banner.html")
  .then((respuesta) => respuesta.text())
  .then((contenido) => {
    document.getElementById("banner").innerHTML = contenido;
  });
