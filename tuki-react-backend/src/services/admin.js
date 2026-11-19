import { peticionApi } from "./api";
import { leerSesion } from "../utils/sesion";

export function apiAdmin(ruta, opciones = {}) {
  return peticionApi(ruta, { ...opciones, token: leerSesion().token });
}
export const pesos = valor => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(valor || 0);
export const estadosEvento = { 1: "Agendado", 2: "Disponible", 3: "Cancelado", 4: "Finalizado" };
export const hoyChile = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Santiago" }).format(new Date());
