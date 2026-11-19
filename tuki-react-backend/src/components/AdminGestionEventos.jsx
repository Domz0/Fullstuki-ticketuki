import { useState } from "react";
import { useAdminDatos } from "../hooks/useAdminDatos";
import { apiAdmin, estadosEvento, hoyChile } from "../services/admin";
import { EstadoAdmin } from "./AdminVentas";
import { eventoConcluido } from "../utils/estadoEvento";

export default function AdminGestionEventos() {
  const consulta = useAdminDatos("/eventos");
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [pestana, setPestana] = useState("actuales");
  const eventos = consulta.datos || [];
  const visibles = eventos.filter(e => eventoConcluido(e) === (pestana === "concluidos")
    && e.nombre_evento.toLowerCase().includes(busqueda.toLowerCase()));
  async function destacar(evento) {
    setGuardando(true); setMensaje(""); setError("");
    try {
      await apiAdmin(`/eventos/${evento.id_evento}/destacado`, { method: "PUT" });
      setMensaje(`“${evento.nombre_evento}” es ahora el destacado del inicio.`); consulta.recargar();
    } catch (fallo) { setError(fallo.message); }
    finally { setGuardando(false); }
  }
  return <section><h1>Gestionar eventos</h1><a className="admin_enlace" href="#/admin/crear-evento">Crear evento</a>
    <p>Selecciona “Destacar” para cambiar la portada del inicio. Solo se admiten eventos disponibles y vigentes.</p>
    <label className="admin_campo">Buscar evento<input type="search" value={busqueda} onChange={e => setBusqueda(e.target.value)} /></label>
    <div className="admin_pestanas" role="group" aria-label="Filtrar eventos">
      {[["actuales", "Actuales"], ["concluidos", "Concluidos"]].map(([id, nombre]) => <button
        key={id} className="admin_boton" aria-pressed={pestana === id} onClick={() => setPestana(id)}>
        {nombre}{consulta.datos ? ` (${eventos.filter(e => eventoConcluido(e) === (id === "concluidos")).length})` : ""}
      </button>)}
    </div>
    {pestana === "concluidos"}
    <EstadoAdmin consulta={consulta} />{mensaje && <p role="status">{mensaje}</p>}{error && <p role="alert">{error}</p>}
    {consulta.datos && <div className="admin_tabla_contenedor"><table className="admin_tabla"><thead><tr>
      {["Evento", "Fecha", "Estado", "Capacidad", "Acciones"].map(t => <th scope="col" key={t}>{t}</th>)}
    </tr></thead><tbody>{visibles.map(e => <tr key={e.id_evento}>
      <td>{e.nombre_evento}{e.destacado && !eventoConcluido(e) && <span className="admin_destacado">Destacado</span>}</td><td>{e.fecha_evento} {e.horario}</td>
      <td>{eventoConcluido(e) ? "Concluido" : estadosEvento[e.estado_evento_id_estado]}</td><td>{e.aforo_evento}</td><td><div className="admin_acciones">
        <a href={`#/admin/editar-evento?id=${e.id_evento}`}>Editar</a><a href={`#/evento/${e.id_evento}`}>Ver evento</a>
        {eventoConcluido(e) ? <span className="admin_estado_concluido">Concluido</span> : <button className="admin_destacar" disabled={guardando || e.destacado || e.estado_evento_id_estado !== 2 || e.fecha_evento < hoyChile()} onClick={() => destacar(e)}>{e.destacado ? "Destacado" : "Destacar"}</button>}
      </div></td>
    </tr>)}</tbody></table>{visibles.length === 0 && <p className="admin_vacio">No hay eventos que coincidan en esta sección.</p>}</div>}
  </section>;
}
