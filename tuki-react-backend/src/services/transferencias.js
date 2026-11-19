import { peticionApi } from "./api";
import { leerSesion } from "../utils/sesion";

export function buscarDestinatario(correo, signal) {
  const { token } = leerSesion();
  const correoBusqueda = encodeURIComponent(correo.trim().toLowerCase());

  return peticionApi(`/usuarios/destinatario?correo=${correoBusqueda}`, {
    token,
    signal,
  });
}

// comprueba con el backend que la entrada es de quien la regala
export function regalarEntrada(entrada, destinatario) {
  const { token } = leerSesion();
  return peticionApi(`/tickets/${entrada.id}/regalar`, {
    method: "PUT",
    token,
    body: {
      destinatario: destinatario.id,
      correo: destinatario.correo,
    },
  });
}
