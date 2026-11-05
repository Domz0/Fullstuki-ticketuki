// Las mismas reglas del registro original, sin almacenamiento ni navegación.
export function validarRegistro(datos) {
  const errores = {}
  const regexCorreo = /^[^\s@]+@(duoc\.cl|gmail\.com|duocuc\.cl|profesor\.duoc\.cl)$/i
  const regexRut = /^([0-9]{7,8}|[0-9]{1,2}\.[0-9]{3}\.[0-9]{3})-[0-9kK]$/

  if (!datos.nombre.trim()) errores.nombre = 'Ingresa tu nombre'
  if (!datos.apellido.trim()) errores.apellido = 'Ingresa tu apellido'

  if (!datos.rut.trim()) errores.rut = 'Ingresa tu RUT'
  else if (!regexRut.test(datos.rut.trim())) errores.rut = 'Usa el formato 12.345.678-5 o 12345678-5'

  if (!datos.correo.trim()) errores.correo = 'Ingresa tu correo'
  else if (datos.correo.trim().length > 100) errores.correo = 'El correo debe tener como máximo 100 caracteres'
  else if (!regexCorreo.test(datos.correo.trim())) errores.correo = 'Correo no válido'

  if (!datos.password.trim()) errores.password = 'Ingresa una contraseña'
  else if (datos.password.length < 4 || datos.password.length > 10) errores.password = 'Debe tener entre 4 y 10 caracteres'

  if (!datos.terminos) errores.terminos = 'Debes aceptar los términos'
  return errores
}
