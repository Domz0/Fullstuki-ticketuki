import DetalleEvento from "../components/DetalleEvento";
import { useEventoDisponible } from "../hooks/useEventoDisponible";
import { categorias } from "../utils/eventos";

function PaginaEvento({ eventoId }) {
  const { evento, error, cargando, reintentar } = useEventoDisponible(eventoId);
  if (cargando) return <p role="status">Cargando evento y disponibilidad…</p>;
  if (error) return <section><p role="alert">{error}</p><button onClick={reintentar}>Reintentar</button></section>;
  return <DetalleEvento evento={{ ...evento, categoriaId: evento.categoria,
    categoria: categorias[evento.categoria], ubicacion: `${evento.recinto}, ${evento.ciudad}`,
    duracion: "Por confirmar", edad: "Por confirmar", trailer: null,
    precioConCargo: evento.precio == null ? 0 : Math.round(evento.precio * 1.1),
  }} />;
}
export default PaginaEvento;