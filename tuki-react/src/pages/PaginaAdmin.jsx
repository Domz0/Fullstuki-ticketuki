import HistorialCompras from "../components/HistorialCompras";
import "./PaginaAdmin.css";

function PaginaAdmin({ seccion, onCerrarSesion }) {
  const historial = seccion === "historial";
  return (
    <div className="admin">
      <aside className="admin_lateral" aria-label="Menú de administración">
        <p className="admin_marca">Ticketuki <span>Admin</span></p>
        <nav className="admin_menu">
          <p>Principal</p>
          <a href="#/admin/dashboard" aria-current={!historial ? "page" : undefined}>Dashboard</a>
          <a href="#/admin/historial" aria-current={historial ? "page" : undefined}>Historial de movimientos</a>
        </nav>
        <div className="admin_pie">
          <a href="#/inicio">Volver al sitio</a>
          <button type="button" onClick={onCerrarSesion}>Cerrar sesión</button>
          <p>AD · Administrador</p>
        </div>
      </aside>
      <main className="admin_contenido" aria-label={historial ? "Historial de movimientos" : "Dashboard"}>
        {historial && <HistorialCompras />}
      </main>
    </div>
  );
}

export default PaginaAdmin;
