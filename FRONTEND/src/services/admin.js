import { peticionApi } from "./api";
import { leerSesion } from "../utils/sesion";

// cansultas a admin necesitan token
export function apiAdmin(ruta, opciones = {}) {
  const { token } = leerSesion();
  return peticionApi(ruta, { ...opciones, token });
}

export function pesos(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(valor || 0);
}

export const estadosEvento = {
  1: "Agendado",
  2: "Disponible",
  3: "Cancelado",
  4: "Finalizado",
};

export function hoyChile() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Santiago",
  }).format(new Date());
}
