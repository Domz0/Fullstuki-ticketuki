const $ = (selector) => document.querySelector(selector);

$("#btnEntradas").addEventListener("click", () => {
  window.location.href = "../../cuenta/mis-entradas/mis-entradas.html";
});

$("#btnHome").addEventListener("click", () => {
  window.location.href = "../../index.html";
});
