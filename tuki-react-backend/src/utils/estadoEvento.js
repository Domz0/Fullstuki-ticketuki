export function eventoConcluido(evento) {
  const hoy = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Santiago" }).format(new Date());
  return evento.estado_evento_id_estado === 4 || Boolean(evento.fecha_evento && evento.fecha_evento < hoy);
}
