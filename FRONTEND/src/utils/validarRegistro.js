export function validarRegistro(datos) {
  const errores = {};
  const formatoCorreo = /^[^\s@]+@(duoc\.cl|gmail\.com|duocuc\.cl|profesor\.duoc\.cl)$/i;
  const formatoRut = /^([0-9]{7,8}|[0-9]{1,2}\.[0-9]{3}\.[0-9]{3})-[0-9kK]$/;
  const nombre = datos.nombre.trim();
  const apellido = datos.apellido.trim();
  const segundoNombre = (datos.segundoNombre || "").trim();
  const apellidoMaterno = datos.apellidoMaterno.trim();
  const rut = datos.rut.trim();
  const correo = datos.correo.trim();

  if (!nombre) errores.nombre = "Ingresa tu nombre";
  if (!apellido) errores.apellido = "Ingresa tu apellido";

  // El segundo nombre y el apellido materno son opcionales
  if (segundoNombre.length > 25) {
    errores.segundoNombre = "No puede exceder 25 caracteres";
  }
  if (apellidoMaterno.length > 25) {
    errores.apellidoMaterno = "Debe tener como máximo 25 caracteres";
  }
  for (const campo of ["nombre", "apellido"]) {
    const longitud = datos[campo].trim().length;
    if (longitud > 0 && (longitud < 2 || longitud > 25)) {
      errores[campo] = "Debe tener entre 2 y 25 caracteres";
    }
  }

  if (!/^[a-zA-Z0-9._-]{3,50}$/.test(datos.username.trim())) {
    errores.username = "Usa entre 3 y 50 caracteres: letras, números, punto, guion o guion bajo";
  }

  if (!rut) {
    errores.rut = "Ingresa tu RUT";
  } else if (!formatoRut.test(rut)) {
    errores.rut = "Usa el formato 12.345.678-5 o 12345678-5";
  }

  if (!correo) {
    errores.correo = "Ingresa tu correo";
  } else if (correo.length > 100) {
    errores.correo = "El correo debe tener como máximo 100 caracteres";
  } else if (!formatoCorreo.test(correo)) {
    errores.correo = "Correo no válido";
  }

  if (!datos.password.trim()) {
    errores.password = "Ingresa una contraseña";
  } else if (datos.password.length < 8 || datos.password.length > 100) {
    errores.password = "Debe tener entre 8 y 100 caracteres";
  }

  if (!datos.confirmacionPassword) {
    errores.confirmacionPassword = "Confirma tu contraseña";
  } else if (datos.confirmacionPassword !== datos.password) {
    errores.confirmacionPassword = "Las contraseñas no coinciden";
  }

  return errores;
}
