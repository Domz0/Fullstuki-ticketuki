import { useEffect, useRef, useState } from "react";
import HistorialCompras from "../components/admin/HistorialCompras";
import Dashboard from "../components/admin/Dashboard";
import CrearEvento from "../components/admin/CrearEvento";
import GestionEventos from "../components/admin/GestionEventos";
import EditarEvento from "../components/admin/EditarEvento";
import EntradasInvitadoDebug from "../components/admin/EntradasInvitadoDebug";
import AdminCodigos from "../components/admin/AdminCodigos";
import AdminUsuarios from "../components/admin/AdminUsuarios";
import "./PaginaAdmin.css";

function PaginaAdmin({ seccion, eventoId, onCerrarSesion }) {
  const menuMovil = useRef(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  function abrirMenu() {
    menuMovil.current.showModal();
    setMenuAbierto(true);
  }

  function cerrarMenu() {
    menuMovil.current?.close();
  }

  // cierra el menú al navegar o volver al tamaño de escritorio
  useEffect(() => {
    const escritorio = window.matchMedia("(min-width: 701px)");
    function revisarAncho() {
      if (escritorio.matches) cerrarMenu();
    }
    window.addEventListener("hashchange", cerrarMenu);
    escritorio.addEventListener("change", revisarAncho);
    return () => {
      window.removeEventListener("hashchange", cerrarMenu);
      escritorio.removeEventListener("change", revisarAncho);
    };
  }, []);

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
    case "usuarios":
      titulo = "Usuarios";
      contenido = <AdminUsuarios />;
      seccionActiva = "usuarios";
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
    { seccion: "crear-evento", nombre: "Crear evento" },
    { seccion: "eventos", nombre: "Gestionar eventos" },
    { seccion: "codigos", nombre: "Códigos de descuento" },
    { seccion: "usuarios", nombre: "Usuarios" },
    { seccion: "historial", nombre: "Historial de movimientos" },
    { seccion: "entradas-invitado", nombre: "Entradas invitado (debug)" },
  ];

  function mostrarOpcionesMenu() {
    return (
      <>
        <nav className="admin_menu">
          <p>Principal</p>
          {opcionesMenu.map(opcion => (
            <a
              key={opcion.seccion}
              href={"#/admin/" + opcion.seccion}
              onClick={cerrarMenu}
              aria-current={seccionActiva === opcion.seccion ? "page" : undefined}
            >
              {opcion.nombre}
            </a>
          ))}
        </nav>
        <div className="admin_pie">
          <a href="#/inicio" onClick={cerrarMenu}>Volver al sitio</a>
          <button type="button" onClick={() => {
            cerrarMenu();
            onCerrarSesion();
          }}>Cerrar sesión</button>
          <p>AD · Administrador</p>
        </div>
      </>
    );
  }

  return (
    <div className="admin">
      <header className="admin_barra_movil">
        <p className="admin_marca">Ticketuki <span>Admin</span></p>
        <button className="admin_boton" type="button" onClick={abrirMenu}
          aria-expanded={menuAbierto} aria-controls="admin_menu_movil" aria-haspopup="dialog">
          <span aria-hidden="true">☰</span> Menú
        </button>
      </header>
      <aside className="admin_lateral admin_lateral_escritorio" aria-label="Menú de administración">
        <p className="admin_marca">Ticketuki <span>Admin</span></p>
        {mostrarOpcionesMenu()}
      </aside>
      <dialog id="admin_menu_movil" className="admin_dialogo" ref={menuMovil}
        aria-label="Panel de administración" onClose={() => setMenuAbierto(false)}
        onClick={event => {
          if (event.target === event.currentTarget) cerrarMenu();
        }}>
        <div className="admin_lateral admin_panel_movil">
          <div className="admin_menu_cabecera">
            <p className="admin_marca">Ticketuki <span>Admin</span></p>
            <button className="admin_boton" type="button" onClick={cerrarMenu} aria-label="Cerrar menú">
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          {mostrarOpcionesMenu()}
        </div>
      </dialog>
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
