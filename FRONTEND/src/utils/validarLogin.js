export function validarLogin(datos) {
  const errores = {};
  const identificador = datos.username.trim();
  const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const formatoUsuario = /^[a-zA-Z0-9._-]{3,50}$/;

  // permite correo o usuario
  if (!identificador) {
    errores.username = "Ingresa tu nombre de usuario o correo";
  } else if (identificador.includes("@")) {
    if (identificador.length > 100 || !formatoCorreo.test(identificador)) {
      errores.username = "Ingresa un correo válido";
    }
  } else if (!formatoUsuario.test(identificador)) {
    errores.username = "Ingresa un nombre de usuario válido";
  }

  if (!datos.password) {
    errores.password = "Ingresa tu contraseña";
  } else if (datos.password.length > 100) {
    errores.password = "Debe tener como máximo 100 caracteres";
  }

  return errores;
}
