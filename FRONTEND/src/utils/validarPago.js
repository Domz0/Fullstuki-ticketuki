// comprobaciones de formato locales
export function tarjetaVencida(vencimiento, hoy = new Date()) {
  const [mes, anioCorto] = vencimiento.split("/").map(Number);
  const anio = 2000 + anioCorto;
  const anioActual = hoy.getFullYear();
  const mesActual = hoy.getMonth() + 1;

  return anio < anioActual || (anio === anioActual && mes < mesActual);
}

// una tarjeta vencida pasa, pero se rechaza al procesar el pago
export function validarPago(datos, metodo) {
  const errores = {};
  const formatoRut = /^([0-9]{7,8}|[0-9]{1,2}\.[0-9]{3}\.[0-9]{3})-[0-9kK]$/;
  const formatoCorreo = /^[^\s@]+@(duoc\.cl|gmail\.com|duocuc\.cl|profesor\.duoc\.cl)$/i;
  const correo = datos.correo.trim();

  if (!datos.nombre.trim()) errores.nombre = "Ingresa tu nombre";
  if (!datos.apellido.trim()) errores.apellido = "Ingresa tu apellido";

  const nombreCompleto = [datos.nombre, datos.segundoNombre, datos.apellido, datos.apellidoMaterno]
    .map(parte => parte?.trim())
    .filter(Boolean)
    .join(" ");
  if (nombreCompleto.length > 50) {
    errores.nombre = "Los nombres y apellidos juntos no pueden superar los 50 caracteres.";
  }

  if (!formatoRut.test(datos.rut.trim())) {
    errores.rut = "Usa el formato 12.345.678-5 o 12345678-5";
  }
  if (correo.length > 254 || !formatoCorreo.test(correo)) {
    errores.correo = "Usa un correo de duoc.cl, gmail.com, duocuc.cl o profesor.duoc.cl";
  }

  if (metodo === "credito") {
    const soloNumerosYEspacios = /^[0-9 ]+$/.test(datos.numero_tarjeta);
    const numeroSinEspacios = datos.numero_tarjeta.replaceAll(" ", "");
    if (!soloNumerosYEspacios || !/^\d{16}$/.test(numeroSinEspacios)) {
      errores.numero_tarjeta = "La tarjeta debe tener 16 números; puedes separarlos con espacios";
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(datos.vencimiento)) {
      errores.vencimiento = "Usa MM/AA con un mes entre 01 y 12";
    }
    if (!/^\d{3,4}$/.test(datos.cvv)) {
      errores.cvv = "El CVV debe tener 3 o 4 números";
    }
  }

  return errores;
}
