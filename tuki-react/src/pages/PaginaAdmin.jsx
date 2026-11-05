import HistorialCompras from "../components/HistorialCompras";
import Dashboard from "../components/Dashboard";
import CrearEvento from "../components/CrearEvento";
import "./PaginaAdmin.css";

function PaginaAdmin({ seccion, onCerrarSesion }) {
  const historial = seccion === "historial";
  const crear = seccion === "crear-evento";
  return (
    <div className="admin">
      <aside className="admin_lateral" aria-label="Menú de administración">
        <p className="admin_marca">Ticketuki <span>Admin</span></p>
        <nav className="admin_menu">
          <p>Principal</p>
          <a href="#/admin/dashboard" aria-current={!historial && !crear ? "page" : undefined}>Dashboard</a>
          <a href="#/admin/crear-evento" aria-current={crear ? "page" : undefined}>Crear evento</a>
          <a href="#/admin/historial" aria-current={historial ? "page" : undefined}>Historial de movimientos</a>
        </nav>
        <div className="admin_pie">
          <a href="#/inicio">Volver al sitio</a>
          <button type="button" onClick={onCerrarSesion}>Cerrar sesión</button>
          <p>AD · Administrador</p>
        </div>
      </aside>
      <main className="admin_contenido" aria-label={historial ? "Historial de movimientos" : crear ? "Crear evento" : "Dashboard"}>
        {historial ? <HistorialCompras /> : crear ? <CrearEvento /> : <Dashboard />}
      </main>
    </div>
  );
}

export default PaginaAdmin;
