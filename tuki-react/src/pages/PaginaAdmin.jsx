import HistorialCompras from "../components/HistorialCompras";
import Dashboard from "../components/Dashboard";
import CrearEvento from "../components/CrearEvento";
import GestionEventos from "../components/GestionEventos";
import EditarEvento from "../components/EditarEvento";
import "./PaginaAdmin.css";

const secciones = {
  "crear-evento": { titulo: "Crear evento", contenido: () => <CrearEvento /> },
  eventos: { titulo: "Gestionar eventos", contenido: () => <GestionEventos /> },
  "editar-evento": { titulo: "Editar evento", contenido: (eventoId) => <EditarEvento id={eventoId} /> },
  historial: { titulo: "Historial de movimientos", contenido: () => <HistorialCompras /> },
};
const dashboard = { titulo: "Dashboard", contenido: () => <Dashboard /> };

function PaginaAdmin({ seccion, eventoId, onCerrarSesion }) {
  const actual = Object.hasOwn(secciones, seccion ?? "") ? secciones[seccion] : dashboard;
  const marcar = (activa) => (activa ? "page" : undefined);
  return (
    <div className="admin">
      <aside className="admin_lateral" aria-label="Menú de administración">
        <p className="admin_marca">Ticketuki <span>Admin</span></p>
        <nav className="admin_menu">
          <p>Principal</p>
          <a href="#/admin/dashboard" aria-current={marcar(actual === dashboard)}>Dashboard</a>
          <a href="#/admin/crear-evento" aria-current={marcar(seccion === "crear-evento")}>Crear evento</a>
          <a href="#/admin/eventos" aria-current={marcar(seccion === "eventos" || seccion === "editar-evento")}>Gestionar eventos</a>
          <a href="#/admin/historial" aria-current={marcar(seccion === "historial")}>Historial de movimientos</a>
        </nav>
        <div className="admin_pie">
          <a href="#/inicio">Volver al sitio</a>
          <button type="button" onClick={onCerrarSesion}>Cerrar sesión</button>
          <p>AD · Administrador</p>
        </div>
      </aside>
      <main className="admin_contenido" aria-label={actual.titulo}>
        {actual.contenido(eventoId)}
      </main>
    </div>
  );
}

export default PaginaAdmin;
