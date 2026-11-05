// Validación de campos del login original. No autentica usuarios.
export function validarLogin(datos) {
  const errores = {}
  const regexCorreo = /^[^\s@]+@(duoc\.cl|gmail\.com|duocuc\.cl|profesor\.duoc\.cl)$/i

  if (!datos.correo.trim()) errores.correo = 'Ingresa tu correo'
  else if (datos.correo.trim().length > 100) errores.correo = 'El correo debe tener como máximo 100 caracteres'
  else if (!regexCorreo.test(datos.correo.trim())) errores.correo = 'Correo no válido'

  if (!datos.password.trim()) errores.password = 'Ingresa tu contraseña'
  else if (datos.password.length < 4 || datos.password.length > 10) errores.password = 'Debe tener entre 4 y 10 caracteres'

  return errores
}
