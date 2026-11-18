export function validarLogin(datos) {
  const errores = {};
  const identificador = datos.username.trim();
  if (!identificador) errores.username = "Ingresa tu nombre de usuario o correo";
  else if (identificador.includes("@")) {
    if (identificador.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identificador))
      errores.username = "Ingresa un correo válido";
  } else if (!/^[a-zA-Z0-9._-]{3,50}$/.test(identificador)) {
    errores.username = "Ingresa un nombre de usuario válido";
  }
  if (!datos.password) errores.password = "Ingresa tu contraseña";
  else if (datos.password.length > 100) errores.password = "Debe tener como máximo 100 caracteres";
  return errores;
}
