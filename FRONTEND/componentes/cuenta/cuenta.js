
(() => {
  const carpetaFrontend = new URL("../../", document.currentScript.src);

  const SECCIONES = [
    { id: "datos", nombre: "Datos personales", ruta: "cuenta/mi-cuenta/mi-cuenta.html" },
    { id: "entradas", nombre: "Mis entradas", ruta: "cuenta/mis-entradas/mis-entradas.html" }
    //{ id: "historial", nombre: "Historial", ruta: "cuenta/historial/historial.html" },
  ];

  function cargar() {
    const contenedor = document.getElementById("cuenta");
    if (!contenedor) return;

    const nombre = localStorage.getItem("nombre") || "";
    const apellido = localStorage.getItem("apellido") || "";
    const correo = localStorage.getItem("correo") || "";
    const conSesion = localStorage.getItem("sesionIniciada") === "true";

    contenedor.innerHTML = `
      <header class="cuenta__perfil">
        <span class="cuenta__avatar" data-iniciales id="cuenta_iniciales" aria-hidden="true"></span>
        <div>
          <h1 class="cuenta__nombre" data-nombre id="cuenta_nombre"></h1>
          <p class="cuenta__datos" data-correo id="cuenta_correo"></p>
        </div>
      </header>
      <nav id="cuenta_secciones" class="cuenta__secciones" aria-label="Secciones de mi cuenta"></nav>
    `;

    // Los datos del usuario van como texto, nunca como html.
    const iniciales = (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
    contenedor.querySelector("#cuenta_iniciales").textContent = iniciales || "TK";
    contenedor.querySelector("#cuenta_nombre").textContent =
      `${nombre} ${apellido}`.trim() || "Mi cuenta";
    const textoCorreo = contenedor.querySelector("#cuenta_correo");
    textoCorreo.textContent = "Miembro desde 2023";
    if (correo) {
      textoCorreo.textContent = correo + " · Miembro desde 2023";
    }

    const nav = contenedor.querySelector("#cuenta_secciones");
    const abierta = document.body.dataset.seccion;

    SECCIONES.forEach((seccion) => {
      const enlace = document.createElement("a");
      enlace.className = "cuenta__seccion";
      enlace.href = new URL(seccion.ruta, carpetaFrontend).href;
      enlace.textContent = seccion.nombre;

      if (seccion.id === abierta) {
        enlace.classList.add("is-activo");
        enlace.setAttribute("aria-current", "page");
      }

      nav.append(enlace);
    });

    if (conSesion) {
      const salir = document.createElement("button");
      salir.type = "button";
      salir.className = "cuenta__seccion cuenta__seccion--salir";
      salir.textContent = "Cerrar sesión";

      salir.addEventListener("click", () => {
        localStorage.setItem("sesionIniciada", "false");
        location.href = new URL("index.html", carpetaFrontend).href;
      });

      nav.append(salir);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cargar);
  } else {
    cargar();
  }
})();
