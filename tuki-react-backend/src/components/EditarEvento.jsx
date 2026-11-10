import CrearEvento from "./CrearEvento";
import { leerEventosCreados } from "../utils/eventos";

function EditarEvento({ id }) {
  let evento;
  try {
    evento = leerEventosCreados().find((item) => item.id === id);
  } catch {
    return <p role="alert">No se pudo cargar el evento. Inténtalo nuevamente.</p>;
  }
  if (!evento) {
    return (
      <section>
        <h1>Evento no encontrado</h1>
        <a href="#/admin/eventos">Volver a gestionar eventos</a>
      </section>
    );
  }
  return <CrearEvento key={id} evento={evento} />;
}

export default EditarEvento;
