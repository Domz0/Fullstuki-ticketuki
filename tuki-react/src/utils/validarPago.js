// Comprobaciones de formato locales: no verifican una tarjeta ni realizan pagos.
export function tarjetaVencida(vencimiento, hoy = new Date()) {
  const [mes, anio] = vencimiento.split("/").map(Number);
  return (
    2000 + anio < hoy.getFullYear() ||
    (2000 + anio === hoy.getFullYear() && mes < hoy.getMonth() + 1)
  );
}

// Una tarjeta vencida pasa esta validación: el rechazo ocurre al procesar el pago.
export function validarPago(datos, metodo) {
  const errores = {};
  if (!datos.nombre.trim()) errores.nombre = "Ingresa tu nombre";
  if (!datos.apellido.trim()) errores.apellido = "Ingresa tu apellido";

  const rut = /^([0-9]{7,8}|[0-9]{1,2}\.[0-9]{3}\.[0-9]{3})-[0-9kK]$/;
  if (!rut.test(datos.rut.trim())) {
    errores.rut = "Usa el formato 12.345.678-5 o 12345678-5";
  }

  const correo =
    /^[^\s@]+@(duoc\.cl|gmail\.com|duocuc\.cl|profesor\.duoc\.cl)$/i;
  if (datos.correo.trim().length > 100 || !correo.test(datos.correo.trim())) {
    errores.correo =
      "Usa un correo de gmail.com, duoc.cl, duocuc.cl o profesor.duoc.cl";
  }

  if (metodo === "credito") {
    if (
      !/^[0-9 ]+$/.test(datos.numero_tarjeta) ||
      !/^\d{16}$/.test(datos.numero_tarjeta.replaceAll(" ", ""))
    ) {
      errores.numero_tarjeta =
        "La tarjeta debe tener 16 números; puedes separarlos con espacios";
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(datos.vencimiento)) {
      errores.vencimiento = "Usa MM/AA con un mes entre 01 y 12";
    }
    if (!/^\d{3,4}$/.test(datos.cvv))
      errores.cvv = "El CVV debe tener 3 o 4 números";
  }
  return errores;
}
