// distribución visual del mapa
const estadio = {
  acceso: "Escenario",
  accesoCol: "4 / span 6",
  filas: [36, 74, 108, 66],
  posiciones: {
    "tribuna-andes": { corto: "Trib. Andes", col: "1 / span 3", fila: "2 / span 3" },
    "cancha-preferencial": { corto: "Cancha Pref.", col: "4 / span 6", fila: "2" },
    "cancha-general": { corto: "Cancha General", col: "4 / span 6", fila: "3" },
    "galeria-sur": { corto: "Galería Sur", col: "4 / span 6", fila: "4" },
    "tribuna-pacifico": { corto: "Trib. Pacífico", col: "10 / span 3", fila: "2 / span 3" },
  },
};

const teatro = {
  acceso: "Escenario",
  accesoCol: "3 / span 8",
  filas: [36, 88, 56, 48, 48],
  posiciones: {
    "palco-izq": { corto: "Palco Izq.", col: "1 / span 2", fila: "2 / span 2" },
    "platea-baja": { corto: "Platea Baja", col: "3 / span 8", fila: "2" },
    "platea-alta": { corto: "Platea Alta", col: "3 / span 8", fila: "3" },
    "palco-der": { corto: "Palco Der.", col: "11 / span 2", fila: "2 / span 2" },
    balcon: { corto: "Balcón", col: "4 / span 6", fila: "4" },
    galeria: { corto: "Galería", col: "4 / span 6", fila: "5" },
  },
};

const arena = {
  acceso: "Escenario",
  accesoCol: "4 / span 6",
  filas: [36, 84, 50, 50, 54],
  posiciones: {
    "lateral-izq": { corto: "Lateral Izq.", col: "1 / span 2", fila: "2 / span 3" },
    cancha: { corto: "Cancha", col: "4 / span 6", fila: "2" },
    "platea-preferencial": { corto: "Platea Pref.", col: "3 / span 8", fila: "3" },
    "tribuna-central": { corto: "Trib. Central", col: "3 / span 8", fila: "4" },
    "lateral-der": { corto: "Lateral Der.", col: "11 / span 2", fila: "2 / span 3" },
    "tribuna-superior": { corto: "Trib. Superior", col: "2 / span 10", fila: "5" },
  },
};

const ferial = {
  acceso: "Acceso principal",
  accesoCol: "4 / span 4",
  filas: [34, 104, 62, 62],
  posiciones: {
    "pabellon-a": { corto: "Pabellón A", col: "1 / span 5", fila: "2" },
    "pabellon-b": { corto: "Pabellón B", col: "7 / span 6", fila: "2" },
    "zona-exterior": { corto: "Zona Exterior", col: "1 / span 12", fila: "3" },
    "acceso-vip": { corto: "Acceso VIP", col: "1 / span 5", fila: "4" },
    "entrada-general": { corto: "Entrada General", col: "7 / span 6", fila: "4" },
  },
};

const planos = { estadio, teatro, arena, ferial };

function tipoRecinto(evento) {
  // por ahora elegimos el diseño según el nombre del recinto
  const nombre = evento.recinto.toLowerCase();
  if (nombre.includes("teatro")) return "teatro";
  if (nombre.includes("arena")) return "arena";
  if (nombre.includes("riesco")) return "ferial";
  return "estadio";
}

export function obtenerPlano(evento) {
  return planos[tipoRecinto(evento)];
}
