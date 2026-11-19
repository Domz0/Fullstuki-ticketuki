import HistorialCompras from "../components/HistorialCompras";
import Dashboard from "../components/Dashboard";
import CrearEvento from "../components/CrearEvento";
import GestionEventos from "../components/GestionEventos";
import EditarEvento from "../components/EditarEvento";
import EntradasInvitadoDebug from "../components/EntradasInvitadoDebug";
import AdminCodigos from "../components/AdminCodigos";
import "./PaginaAdmin.css";

function PaginaAdmin({ seccion, eventoId, onCerrarSesion }) {
  let titulo = "Dashboard";
  let contenido = <Dashboard />;
  let seccionActiva = "dashboard";

  switch (seccion) {
    case "codigos":
      titulo = "Códigos de descuento";
      contenido = <AdminCodigos />;
      seccionActiva = "codigos";
      break;
    case "entradas-invitado":
      titulo = "Entradas invitado (debug)";
      contenido = <EntradasInvitadoDebug />;
      seccionActiva = "entradas-invitado";
      break;
    case "crear-evento":
      titulo = "Crear evento";
      contenido = <CrearEvento />;
      seccionActiva = "crear-evento";
      break;
    case "eventos":
      titulo = "Gestionar eventos";
      contenido = <GestionEventos />;
      seccionActiva = "eventos";
      break;
    case "editar-evento":
      titulo = "Editar evento";
      contenido = <EditarEvento id={eventoId} />;
      seccionActiva = "eventos";
      break;
    case "historial":
      titulo = "Historial de movimientos";
      contenido = <HistorialCompras />;
      seccionActiva = "historial";
      break;
    default:
      break;
  }

  const opcionesMenu = [
    { seccion: "dashboard", nombre: "Dashboard" },
    { seccion: "entradas-invitado", nombre: "Entradas invitado (debug)" },
    { seccion: "crear-evento", nombre: "Crear evento" },
    { seccion: "codigos", nombre: "Códigos de descuento" },
    { seccion: "eventos", nombre: "Gestionar eventos" },
    { seccion: "historial", nombre: "Historial de movimientos" },
  ];

  return (
    <div className="admin">
      <aside className="admin_lateral" aria-label="Menú de administración">
        <p className="admin_marca">Ticketuki <span>Admin</span></p>
        <nav className="admin_menu">
          <p>Principal</p>
          {opcionesMenu.map(opcion => (
            <a
              key={opcion.seccion}
              href={"#/admin/" + opcion.seccion}
              aria-current={seccionActiva === opcion.seccion ? "page" : undefined}
            >
              {opcion.nombre}
            </a>
          ))}
        </nav>
        <div className="admin_pie">
          <a href="#/inicio">Volver al sitio</a>
          <button type="button" onClick={onCerrarSesion}>Cerrar sesión</button>
          <p>AD · Administrador</p>
        </div>
      </aside>
      {/* reinicia los formularios al cambiar de seccion */}
      <main
        className="admin_contenido"
        aria-label={titulo}
        key={seccion + "-" + (eventoId || "")}
      >
        {contenido}
      </main>
    </div>
  );
}

export default PaginaAdmin;
