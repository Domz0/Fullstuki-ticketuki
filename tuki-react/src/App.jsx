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
import PaginaPago from "./pages/PaginaPago";
import PaginaConfirmacion from "./pages/PaginaConfirmacion";
import PaginaPagoFallido from "./pages/PaginaPagoFallido";
import PaginaTransferir from "./pages/PaginaTransferir";
import PaginaNoEncontrada from "./pages/PaginaNoEncontrada";
import PaginaAdmin from "./pages/PaginaAdmin";
import { obtenerEvento } from "./data/obtenerEvento";
import { obtenerUsuario, cerrarSesion } from "./utils/sesion";
import { leerRuta, navegar } from "./utils/navegacion";
import "./App.css";

function App() {
  const [usuario, setUsuario] = useState(() => {
    try { return obtenerUsuario(); } catch { return null; }
  });

  function salir() {
    cerrarSesion();
    setUsuario(null);
    navegar("/inicio");
  }

  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    function actualizar() {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    }
    window.addEventListener("hashchange", actualizar);
    return () => window.removeEventListener("hashchange", actualizar);
  }, []);

  const { pantalla, id, parametros } = leerRuta(hash);
  useEffect(() => {
    if (["cuenta", "transferir"].includes(pantalla) && !usuario) navegar("/login");
    if (["login", "registro", "cuenta"].includes(pantalla) && usuario?.rol === "admin") navegar("/admin/dashboard");
    else if (["login", "registro"].includes(pantalla) && usuario) navegar("/cuenta/datos");
    if (pantalla === "admin" && usuario?.rol !== "admin") navegar(usuario ? "/inicio" : "/login");
  }, [pantalla, usuario]);

  const categoria = ["musica", "artes", "deportes", "ferias"].includes(id)
    ? id
    : "musica";
  const evento = obtenerEvento(id);
  const fecha =
    evento?.fechas.find((item) => item.id === parametros.get("fecha")) ||
    evento?.fechas[0];

  const esAcceso = pantalla === "login" || pantalla === "registro";
  let contenido;

  if (pantalla === "admin") {
    return usuario?.rol === "admin"
      ? <PaginaAdmin seccion={id} eventoId={parametros.get("id")} onCerrarSesion={salir} />
      : null;
  }

  if (pantalla === "inicio") contenido = <Inicio />;
  else if (pantalla === "catalogo")
    contenido = (
      <PaginaCatalogo
        categoria={categoria}
        busqueda={parametros.get("q") || ""}
      />
    );
  else if (pantalla === "registro") contenido = <PaginaRegistro />;
  else if (pantalla === "login") contenido = <PaginaLogin onIniciarSesion={setUsuario} registroExitoso={parametros.get("registro") === "ok"} />;
  else if (pantalla === "cuenta" && usuario)
    contenido = (
      <PaginaCuenta usuario={usuario} onCerrarSesion={salir} onActualizarUsuario={setUsuario} seccion={id === "entradas" ? "entradas" : "datos"} />
    );
  else if (pantalla === "cuenta") contenido = null;
  else if (pantalla === "transferir")
    contenido = usuario ? <PaginaTransferir usuario={usuario} codigo={id} /> : null;
  else if (evento && pantalla === "evento")
    contenido = <PaginaEvento evento={evento} />;
  else if (evento && pantalla === "entradas")
    contenido = (
      <PaginaEntradas evento={evento} fecha={fecha} />
    );
  else if (evento && pantalla === "pago")
    contenido = (
      <PaginaPago
        usuario={usuario}
        evento={evento}
        fecha={fecha}
      />
    );
  else if (evento && pantalla === "pago-fallido")
    contenido = <PaginaPagoFallido evento={evento} fecha={fecha} />;
  else if (evento && pantalla === "confirmacion")
    contenido = (
      <PaginaConfirmacion
        evento={evento}
        fecha={fecha}
      />
    );
  else contenido = <PaginaNoEncontrada />;

  return (
    <>
      {!esAcceso && <Header usuario={usuario} onCerrarSesion={salir} categoria={pantalla === "catalogo" ? categoria : undefined} />}
      <main className={`pantalla pantalla_${pantalla}`} key={hash}>
        {contenido}
      </main>
      {!esAcceso && <Footer />}
    </>
  );
}

export default App;
