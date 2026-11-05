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
import PaginaGestionEntrada from "./pages/PaginaGestionEntrada";
import PaginaNoEncontrada from "./pages/PaginaNoEncontrada";
import { obtenerEvento } from "./data/obtenerEvento";
import { leerRuta } from "./utils/navegacion";
import "./App.css";

function App() {
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
  const categoria = ["musica", "artes", "deportes", "ferias"].includes(id)
    ? id
    : "musica";
  const evento = obtenerEvento(id);
  const cantidadPedida = Number(parametros.get("cantidad")) || 1;
  const cantidad = Math.max(1, Math.min(6, Math.floor(cantidadPedida)));
  const fecha =
    evento?.fechas.find((item) => item.id === parametros.get("fecha")) ||
    evento?.fechas[0];
  const seleccion = {
    area: "Cancha Preferencial",
    precio: evento?.precio || 85000,
    tasaServicio: 0.1,
  };
  let contenido;

  if (pantalla === "inicio") contenido = <Inicio />;
  else if (pantalla === "catalogo")
    contenido = (
      <PaginaCatalogo
        categoria={categoria}
        busqueda={parametros.get("q") || ""}
      />
    );
  else if (pantalla === "registro") contenido = <PaginaRegistro />;
  else if (pantalla === "login") contenido = <PaginaLogin />;
  else if (pantalla === "cuenta")
    contenido = (
      <PaginaCuenta seccion={id === "entradas" ? "entradas" : "datos"} />
    );
  else if (["transferir", "revender"].includes(pantalla))
    contenido = <PaginaGestionEntrada accion={pantalla} codigo={id} />;
  else if (evento && pantalla === "evento")
    contenido = <PaginaEvento evento={evento} />;
  else if (evento && pantalla === "entradas")
    contenido = (
      <PaginaEntradas evento={evento} fecha={fecha} seleccion={seleccion} />
    );
  else if (evento && pantalla === "pago")
    contenido = (
      <PaginaPago
        evento={evento}
        fecha={fecha}
        seleccion={seleccion}
        cantidad={cantidad}
      />
    );
  else if (evento && pantalla === "confirmacion")
    contenido = (
      <PaginaConfirmacion
        evento={evento}
        fecha={fecha}
        seleccion={seleccion}
        cantidad={cantidad}
        metodo={parametros.get("metodo")}
      />
    );
  else contenido = <PaginaNoEncontrada />;

  return (
    <>
      <Header categoria={pantalla === "catalogo" ? categoria : undefined} />
      <main className={`pantalla pantalla_${pantalla}`} key={hash}>
        {contenido}
      </main>
      <Footer />
    </>
  );
}

export default App;
