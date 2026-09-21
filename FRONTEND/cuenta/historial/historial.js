const sesionIniciada = localStorage.getItem("sesionIniciada");
if (sesionIniciada !== "true") {
  window.location.href = "../login/login.html";
} //si no estai logueado te fuiste al lobby
