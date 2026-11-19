import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Inicio from "./pages/Inicio";
import PaginaCatalogo from "./pages/PaginaCatalogo";
import PaginaRegistro from "./pages/PaginaRegistro";
import PaginaLogin from "./pages/PaginaLogin";
import PaginaCuenta from "./pages/PaginaCuenta";
import PaginaEvento from "./pages/PaginaEvento";
import PaginaEntradas from "./pages/PaginaEntradas";
import PaginaFlujoCompra from "./pages/PaginaFlujoCompra";
import PaginaTransferir from "./pages/PaginaTransferir";
import PaginaNoEncontrada from "./pages/PaginaNoEncontrada";
import PaginaAdmin from "./pages/PaginaAdmin";
import { obtenerUsuario, cerrarSesion } from "./utils/sesion";
import { leerRuta, navegar } from "./utils/navegacion";
import { expirarSesion, limpiarDatosPrivados, sesionGuardada } from "./utils/controlSesion";
import "./App.css";

function App() {
  const [usuario, setUsuario] = useState(obtenerUsuario);
  const [hash, setHash] = useState(window.location.hash);
  const { pantalla, id, parametros } = leerRuta(hash);

  const esAdministrador = usuario?.rol === "admin";
  const esAcceso = pantalla === "login" || pantalla === "registro";
  const categoria = ["musica", "artes", "deportes", "ferias"].includes(id) ? id : "musica";
  const seccionCuenta = ["entradas", "historial"].includes(id) ? id : "datos";

  function salir() {
    cerrarSesion();
    setUsuario(null);
    navegar("/inicio");
  }

  // mantiene la pantalla sincronizada con el vencimiento y cierre de sesion
  useEffect(() => {
    const sesionInicial = sesionGuardada();

    function mostrarSesionVencida() {
      setUsuario(null);
      navegar("/login?sesion=vencida");
    }

    function quitarUsuario() {
      setUsuario(null);
    }

    function revisarVencimiento() {
      const actual = sesionGuardada();
      if (actual?.token && actual.expiraEn <= Date.now()) {
        expirarSesion(actual.token);
      }
    }

    function sincronizarSesion(evento) {
      // storage avisa cuando otra pestaña modifica los datos del navegador
      if (evento.key !== "sesionBackend" && evento.key !== null) return;

      const actual = sesionGuardada();
      if (actual?.token !== sesionInicial?.token) {
        limpiarDatosPrivados();
        setUsuario(null);
        navegar("/login?sesion=cambiada");
        return;
      }
      revisarVencimiento();
    }

    window.addEventListener("sesion-vencida", mostrarSesionVencida);
    window.addEventListener("sesion-cerrada", quitarUsuario);
    window.addEventListener("storage", sincronizarSesion);
    window.addEventListener("focus", revisarVencimiento);

    let temporizador;
    if (sesionInicial?.token) {
      const tiempoRestante = sesionInicial.expiraEn - Date.now();
      // setTimeout admite como máximo este número de milisegundos
      const limiteTemporizador = 2147483647;
      const espera = Math.max(0, Math.min(tiempoRestante, limiteTemporizador));
      temporizador = setTimeout(revisarVencimiento, espera);
    }

    return () => {
      clearTimeout(temporizador);
      window.removeEventListener("sesion-vencida", mostrarSesionVencida);
      window.removeEventListener("sesion-cerrada", quitarUsuario);
      window.removeEventListener("storage", sincronizarSesion);
      window.removeEventListener("focus", revisarVencimiento);
    };
  }, [usuario]);

  // cambiar el hash abre otra pantalla y vuelve al inicio de la pagina
  useEffect(() => {
    function actualizarRuta() {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    }

    window.addEventListener("hashchange", actualizarRuta);
    return () => window.removeEventListener("hashchange", actualizarRuta);
  }, []);

  // redirige segun la sesion, el backend tambien comprueba los permisos
  useEffect(() => {
    if (pantalla === "admin") {
      if (!usuario) {
        navegar("/login");
      } else if (!esAdministrador) {
        navegar("/inicio");
      }
      return;
    }

    const requiereCuenta = pantalla === "cuenta" || pantalla === "transferir";
    if (requiereCuenta && !usuario) {
      navegar("/login");
      return;
    }
    if (esAdministrador && (esAcceso || requiereCuenta)) {
      navegar("/admin/dashboard");
      return;
    }
    if (esAcceso && usuario) {
      navegar("/cuenta/datos");
    }
  }, [pantalla, usuario, esAdministrador, esAcceso]);

  // cada ruta devuelve su pagina con los datos que necesita
  function mostrarPagina() {
    switch (pantalla) {
      case "inicio":
        return <Inicio />;
      case "catalogo":
        return (
          <PaginaCatalogo
            categoria={categoria}
            busqueda={parametros.get("q") || ""}
          />
        );
      case "registro":
        return <PaginaRegistro />;
      case "login":
        return (
          <PaginaLogin
            onIniciarSesion={setUsuario}
            registroExitoso={parametros.get("registro") === "ok"}
            contrasenaActualizada={parametros.get("contrasena") === "ok"}
          />
        );
      case "cuenta":
        if (!usuario) return null;
        return (
          <PaginaCuenta
            usuario={usuario}
            onCerrarSesion={salir}
            onActualizarUsuario={setUsuario}
            seccion={seccionCuenta}
          />
        );
      case "transferir":
        if (usuario?.rol !== "cliente") return null;
        return <PaginaTransferir usuario={usuario} />;
      case "evento":
        return <PaginaEvento eventoId={id} />;
      case "entradas":
        return <PaginaEntradas eventoId={id} />;
      case "pago":
      case "pago-fallido":
      case "confirmacion":
        return (
          <PaginaFlujoCompra
            eventoId={id}
            fechaId={parametros.get("fecha")}
            pantalla={pantalla}
            usuario={usuario}
          />
        );
      default:
        return <PaginaNoEncontrada />;
    }
  }

  // el administrador utiliza su propia barra lateral
  if (pantalla === "admin") {
    if (!esAdministrador) return null;
    return (
      <PaginaAdmin
        seccion={id}
        eventoId={parametros.get("id")}
        onCerrarSesion={salir}
      />
    );
  }

  return (
    <>
      {!esAcceso && (
        <Header
          usuario={usuario}
          onCerrarSesion={salir}
          categoria={pantalla === "catalogo" ? categoria : undefined}
        />
      )}
      <main className={`pantalla pantalla_${pantalla}`} key={hash}>
        {mostrarPagina()}
      </main>
      {!esAcceso && <Footer />}
    </>
  );
}

export default App;
