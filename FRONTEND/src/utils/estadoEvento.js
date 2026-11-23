export function eventoConcluido(evento) {
  const hoy = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Santiago",
  }).format(new Date());

  // YYYY-MM-DD permite comparar fechas sin convertirlas a la hora del navegador
  const fechaPasada = Boolean(evento.fecha_evento && evento.fecha_evento < hoy);
  const finalizado = evento.estado_evento_id_estado === 4;
  return finalizado || fechaPasada;
}
