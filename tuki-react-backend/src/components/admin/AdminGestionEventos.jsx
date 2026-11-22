import { useState } from "react";
import { useAdminDatos } from "../../hooks/useAdminDatos";
import { apiAdmin, estadosEvento, hoyChile } from "../../services/admin";
import { EstadoAdmin } from "./AdminVentas";
import { eventoConcluido } from "../../utils/estadoEvento";

export default function AdminGestionEventos() {
  const consulta = useAdminDatos("/eventos");
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [pestana, setPestana] = useState("actuales");

  const eventos = consulta.datos || [];
  const actuales = eventos.filter(evento => !eventoConcluido(evento));
  const concluidos = eventos.filter(eventoConcluido);
  const lista = pestana === "concluidos" ? concluidos : actuales;
  const visibles = lista.filter(evento =>
    evento.nombre_evento.toLowerCase().includes(busqueda.toLowerCase()),
  );
  const pestanas = [
    { id: "actuales", nombre: "Actuales", cantidad: actuales.length },
    { id: "concluidos", nombre: "Concluidos", cantidad: concluidos.length },
  ];

  // guarda el destacado y vuelve a consultar la lista
  async function destacar(evento) {
    setGuardando(true);
    setMensaje("");
    setError("");
    try {
      await apiAdmin(`/eventos/${evento.id_evento}/destacado`, { method: "PUT" });
      setMensaje(`"${evento.nombre_evento}" es ahora el destacado del inicio.`);
      consulta.recargar();
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section>
      <h1>Gestionar eventos</h1>
      <a className="admin_enlace" href="#/admin/crear-evento">Crear evento</a>
      <p>Selecciona "Destacar" para cambiar la portada del inicio. Solo se admiten eventos disponibles y vigentes.</p>
      <label className="admin_campo">
        Buscar evento
        <input type="search" value={busqueda} onChange={evento => setBusqueda(evento.target.value)} />
      </label>
      <div className="admin_pestanas" role="group" aria-label="Filtrar eventos">
        {pestanas.map(opcion => (
          <button
            key={opcion.id}
            className="admin_boton"
            aria-pressed={pestana === opcion.id}
            onClick={() => setPestana(opcion.id)}
          >
            {opcion.nombre}{consulta.datos && ` (${opcion.cantidad})`}
          </button>
        ))}
      </div>
      <EstadoAdmin consulta={consulta} />
      {mensaje && <p role="status">{mensaje}</p>}
      {error && <p role="alert">{error}</p>}
      {consulta.datos && (
        <div className="admin_tabla_contenedor">
          <table className="admin_tabla">
            <thead>
              <tr>
                {["Evento", "Fecha", "Estado", "Capacidad", "Acciones"].map(titulo => (
                  <th scope="col" key={titulo}>{titulo}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibles.map(evento => {
                const concluido = eventoConcluido(evento);
                const puedeDestacar = !guardando && !evento.destacado
                  && evento.estado_evento_id_estado === 2 && evento.fecha_evento >= hoyChile();

                return (
                  <tr key={evento.id_evento}>
                    <td data-label="Evento">
                      {evento.nombre_evento}
                      {evento.destacado && !concluido && <span className="admin_destacado">Destacado</span>}
                    </td>
                    <td data-label="Fecha">{evento.fecha_evento} {evento.horario}</td>
                    <td data-label="Estado">{concluido ? "Concluido" : estadosEvento[evento.estado_evento_id_estado]}</td>
                    <td data-label="Capacidad">{evento.aforo_evento}</td>
                    <td data-label="Acciones">
                      <div className="admin_acciones">
                        <a href={`#/admin/editar-evento?id=${evento.id_evento}`}>Editar</a>
                        <a href={`#/evento/${evento.id_evento}`}>Ver evento</a>
                        {concluido ? (
                          <span className="admin_estado_concluido">Concluido</span>
                        ) : (
                          <button className="admin_destacar" disabled={!puedeDestacar} onClick={() => destacar(evento)}>
                            {evento.destacado ? "Destacado" : "Destacar"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visibles.length === 0 && <p className="admin_vacio">No hay eventos que coincidan en esta sección.</p>}
        </div>
      )}
    </section>
  );
}
