import EsqueletoEventos from "../components/EsqueletoEventos";
import DetalleEvento from "../components/DetalleEvento";
import { useEventoDisponible } from "../hooks/useEventoDisponible";
import { categorias } from "../utils/eventos";

// el hook consulta los datos y mantiene actualizada la disponibilidad
function PaginaEvento({ eventoId }) {
  const { evento, error, cargando, reintentar } = useEventoDisponible(eventoId);

  if (cargando) {
    return <EsqueletoEventos vista="detalle" />;
  }

  if (error) {
    return (
      <section>
        <p role="alert">{error}</p>
        <button onClick={reintentar}>Reintentar</button>
      </section>
    );
  }

  // precio base, el resto lo hace el backend
  let precioConCargo = null;
  if (evento.precio != null) {
    const iva = Math.round(evento.precio * 0.19);
    const cargo = Math.round(evento.precio * 0.1);
    precioConCargo = evento.precio + iva + cargo;
  }

  const datosEvento = {
    ...evento,
    categoriaId: evento.categoria,
    categoria: categorias[evento.categoria],
    ubicacion: evento.recinto + ", " + evento.ciudad,
    duracion: "Por confirmar",
    edad: "Por confirmar",
    trailer: null,
    precioConCargo,
  };

  return <DetalleEvento evento={datosEvento} />;
}

export default PaginaEvento;
