import { useState } from "react";
import { categorias, eliminarEvento, leerEventosCreados } from "../utils/eventos";

function GestionEventos() {
  const [eventos, setEventos] = useState(() => {
    try {
      return leerEventosCreados();
    } catch {
      return null;
    }
  });
  const [mensaje, setMensaje] = useState("");

  if (!eventos) return <p role="alert">No se pudieron cargar los eventos. Inténtalo nuevamente.</p>;

  function eliminar(evento) {
    if (!window.confirm(`¿Eliminar "${evento.nombre}"?`)) return;
    try {
      eliminarEvento(evento.id);
      setEventos(leerEventosCreados());
      setMensaje("Evento eliminado.");
    } catch {
      setMensaje("No se pudo eliminar el evento. Inténtalo nuevamente.");
    }
  }

  return (
    <section>
      <h1>Gestionar eventos</h1>
      <p role="status">{mensaje}</p>
      {eventos.length === 0 ? (
        <p>No hay eventos creados. <a className="admin_enlace" href="#/admin/crear-evento">Crear evento</a></p>
      ) : (
        <div className="admin_tabla_contenedor">
          <table className="admin_tabla">
            <thead>
              <tr>
                <th scope="col">Evento</th>
                <th scope="col">Categoría</th>
                <th scope="col">Detalle</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((evento) => (
                <tr key={evento.id}>
                  <td>{evento.nombre}</td>
                  <td>{categorias[evento.categoria]}</td>
                  <td>{evento.detalle}</td>
                  <td>
                    <div className="admin_acciones">
                      <a href={`#/admin/editar-evento?id=${encodeURIComponent(evento.id)}`} aria-label={`Editar ${evento.nombre}`}>Editar</a>
                      <button type="button" aria-label={`Eliminar ${evento.nombre}`} onClick={() => eliminar(evento)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default GestionEventos;
