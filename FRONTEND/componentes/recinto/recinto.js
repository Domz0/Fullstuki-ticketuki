/*
  catalogo/evento/evento.html     -> vista previa del recinto (sin clics)
  checkout/entradas/entradas.html-> seleccion de area

  cargo por servicio es un 10%
*/
(() => {
  const CARGO = 0.1;

  const RECINTOS = {
    estadio: {
      id: "estadio",
      etiqueta: "Estadio",
      nombre: "Estadio Nacional",
      ciudad: "Ñuñoa",
      acceso: "Escenario",
      accesoCol: "4 / span 6",
      filas: [36, 74, 108, 66],
      sectores: [
        { id: "tribuna-andes", nombre: "Tribuna Andes", corto: "Trib. Andes", precio: 35000, estado: "disponible", col: "1 / span 3", fila: "2 / span 3" },
        { id: "cancha-preferencial", nombre: "Cancha Preferencial", corto: "Cancha Pref.", precio: 85000, estado: "disponible", col: "4 / span 6", fila: "2" },
        { id: "cancha-general", nombre: "Cancha General", corto: "Cancha General", precio: 45000, estado: "disponible", col: "4 / span 6", fila: "3" },
        { id: "galeria-sur", nombre: "Galería Sur", corto: "Galería Sur", precio: 22000, estado: "disponible", col: "4 / span 6", fila: "4" },
        { id: "tribuna-pacifico", nombre: "Tribuna Pacífico", corto: "Trib. Pacífico", precio: 35000, estado: "agotada", col: "10 / span 3", fila: "2 / span 3" },
      ],
    },

    teatro: {
      id: "teatro",
      etiqueta: "Teatro",
      nombre: "Teatro Municipal",
      ciudad: "Santiago",
      acceso: "Escenario",
      accesoCol: "3 / span 8",
      filas: [36, 88, 56, 48, 48],
      sectores: [
        { id: "palco-izq", nombre: "Palco Izq.", corto: "Palco Izq.", precio: 45000, estado: "disponible", col: "1 / span 2", fila: "2 / span 2" },
        { id: "platea-baja", nombre: "Platea Baja", corto: "Platea Baja", precio: 38000, estado: "disponible", col: "3 / span 8", fila: "2" },
        { id: "platea-alta", nombre: "Platea Alta", corto: "Platea Alta", precio: 28000, estado: "disponible", col: "3 / span 8", fila: "3" },
        { id: "palco-der", nombre: "Palco Der.", corto: "Palco Der.", precio: 45000, estado: "disponible", col: "11 / span 2", fila: "2 / span 2" },
        { id: "balcon", nombre: "Balcón", corto: "Balcón", precio: 20000, estado: "agotada", col: "4 / span 6", fila: "4" },
        { id: "galeria", nombre: "Galería", corto: "Galería", precio: 12000, estado: "disponible", col: "4 / span 6", fila: "5" },
      ],
    },

    arena: {
      id: "arena",
      etiqueta: "Arena",
      nombre: "Arena Central",
      ciudad: "Santiago",
      acceso: "Escenario",
      accesoCol: "4 / span 6",
      filas: [36, 84, 50, 50, 54],
      sectores: [
        { id: "lateral-izq", nombre: "Lateral Izq.", corto: "Lateral Izq.", precio: 26000, estado: "disponible", col: "1 / span 2", fila: "2 / span 3" },
        { id: "cancha", nombre: "Cancha", corto: "Cancha", precio: 70000, estado: "disponible", col: "4 / span 6", fila: "2" },
        { id: "platea-preferencial", nombre: "Platea Preferencial", corto: "Platea Pref.", precio: 52000, estado: "disponible", col: "3 / span 8", fila: "3" },
        { id: "tribuna-central", nombre: "Tribuna Central", corto: "Trib. Central", precio: 34000, estado: "disponible", col: "3 / span 8", fila: "4" },
        { id: "lateral-der", nombre: "Lateral Der.", corto: "Lateral Der.", precio: 26000, estado: "disponible", col: "11 / span 2", fila: "2 / span 3" },
        { id: "tribuna-superior", nombre: "Tribuna Superior", corto: "Trib. Superior", precio: 18000, estado: "disponible", col: "2 / span 10", fila: "5" },
      ],
    },

    ferial: {
      id: "ferial",
      etiqueta: "Ferial",
      nombre: "Espacio Riesco",
      ciudad: "Huechuraba",
      acceso: "Acceso principal",
      accesoCol: "4 / span 4",
      filas: [34, 104, 62, 62],
      sectores: [
        { id: "pabellon-a", nombre: "Pabellón A", corto: "Pabellón A", precio: 8000, estado: "disponible", col: "1 / span 5", fila: "2" },
        { id: "pabellon-b", nombre: "Pabellón B", corto: "Pabellón B", precio: 8000, estado: "disponible", col: "7 / span 6", fila: "2" },
        { id: "zona-exterior", nombre: "Zona Exterior · Food", corto: "Zona Exterior", precio: 5000, estado: "disponible", col: "1 / span 12", fila: "3" },
        { id: "acceso-vip", nombre: "Acceso VIP · Pase de día", corto: "Acceso VIP", precio: 15000, estado: "disponible", col: "1 / span 5", fila: "4" },
        { id: "entrada-general", nombre: "Entrada General", corto: "Entrada General", precio: 10000, estado: "agotada", col: "7 / span 6", fila: "4" },
      ],
    },
  };

  const pesos = (valor) => "$" + Number(valor).toLocaleString("es-CL");

  const cargoPorServicio = (subtotal) => Math.round(subtotal * CARGO);

  const crearTexto = (clase, texto) => {
    const span = document.createElement("span");
    span.className = clase;
    span.textContent = texto;
    return span;
  };

  // `tamano` es un porcentaje: 100 es el plano completo, 70 la vista previa.
  const pintar = (contenedor, recinto, tamano, idElegido, clicables) => {
    const filas = [];
    recinto.filas.forEach((alto) => {
      filas.push(Math.round((alto * tamano) / 100) + "px");
    });

    contenedor.innerHTML = "";
    contenedor.classList.add("mapa");
    contenedor.classList.toggle("mapa--vista", !clicables);
    contenedor.style.gridTemplateRows = filas.join(" ");

    const acceso = crearTexto("mapa__acceso", recinto.acceso);
    acceso.style.gridColumn = recinto.accesoCol;
    acceso.style.gridRow = "1";
    contenedor.append(acceso);

    recinto.sectores.forEach((sector) => {
      const agotada = sector.estado === "agotada";
      const clicable = clicables && !agotada;

      const caja = document.createElement(clicable ? "button" : "div");
      caja.className = "mapa__sector";
      caja.dataset.sector = sector.id;
      caja.style.gridColumn = sector.col;
      caja.style.gridRow = sector.fila;

      if (agotada) caja.classList.add("mapa__sector--agotada");
      if (sector.id === idElegido) caja.classList.add("is-activo");

      if (clicable) {
        caja.type = "button";
        // El nombre visible cambia segun el ancho, asi que se nombra a mano.
        caja.setAttribute("aria-label", `${sector.nombre}, ${pesos(sector.precio)}`);
      }

      caja.append(
        crearTexto("mapa__nombre", sector.nombre),
        crearTexto("mapa__nombre mapa__nombre--corto", sector.corto),
        crearTexto("mapa__precio", agotada ? "Agotada" : pesos(sector.precio))
      );

      contenedor.append(caja);
    });
  };

  // Mapa de la pantalla de entradas: sus sectores son botones.
  const dibujarMapa = (contenedor, recinto, elegido) => {
    let id = "";
    if (elegido) id = elegido.id;
    pintar(contenedor, recinto, 100, id, true);
  };

  // Mapita del detalle del evento: solo se mira.
  const dibujarVistaPrevia = (contenedor, recinto) => {
    pintar(contenedor, recinto, 70, "", false);
  };

  window.Recinto = {
    RECINTOS,
    pesos,
    cargoPorServicio,
    dibujarMapa,
    dibujarVistaPrevia,
  };
})();
