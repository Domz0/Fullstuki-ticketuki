import { normalizarRut } from "./entradas";

export function validarTransferencia(datos, usuario) {
  const errores = {};
  const regexCorreo =
    /^[^\s@]+@(duoc\.cl|gmail\.com|duocuc\.cl|profesor\.duoc\.cl)$/i;
  const regexRut = /^([0-9]{7,8}|[0-9]{1,2}\.[0-9]{3}\.[0-9]{3})-[0-9kK]$/;

  if (!datos.nombre.trim()) errores.nombre = "Ingresa el nombre del nuevo titular";

  if (!datos.rut.trim()) errores.rut = "Ingresa el RUT del nuevo titular";
  else if (!regexRut.test(datos.rut.trim()))
    errores.rut = "Usa el formato 12.345.678-5 o 12345678-5";
  else if (normalizarRut(datos.rut) === normalizarRut(usuario.rut))
    errores.rut = "No puedes transferirte la entrada a ti mismo";

  if (!datos.correo.trim()) errores.correo = "Ingresa el correo del nuevo titular";
  else if (datos.correo.trim().length > 100)
    errores.correo = "El correo debe tener como máximo 100 caracteres";
  else if (!regexCorreo.test(datos.correo.trim()))
    errores.correo = "Correo no válido";

  return errores;
}
