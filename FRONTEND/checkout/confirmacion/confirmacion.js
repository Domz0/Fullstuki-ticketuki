const $ = (selector) => document.querySelector(selector);

$("#btnEntradas").addEventListener("click", () => {
  window.location.href = "entradas.html"; //HAY QUE CAMBIAR ESTO POR LA Q ES
});

$("#btnHome").addEventListener("click", () => {
  window.location.href = "../../index.html";
});
