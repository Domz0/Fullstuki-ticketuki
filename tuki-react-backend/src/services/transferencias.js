import { peticionApi } from "./api";
import { leerSesion } from "../utils/sesion";

export function buscarDestinatario(correo, signal) {
  return peticionApi(`/usuarios/destinatario?correo=${encodeURIComponent(correo.trim().toLowerCase())}`, {
    token: leerSesion().token, signal,
  });
}

export function regalarEntrada(entrada, destinatario) {
  return peticionApi(`/tickets/${entrada.id}/regalar`, { method: "PUT", token: leerSesion().token,
    body: { destinatario: destinatario.id, correo: destinatario.correo } });
}
