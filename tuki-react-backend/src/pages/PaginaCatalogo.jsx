import { useEffect, useState } from "react";
import EsqueletoEventos from "../components/comunes/EsqueletoEventos";
import CatalogoEventos from "../components/eventos/CatalogoEventos";
import { cargarCatalogo } from "../services/eventos";

// carga el catalogo con los filtros
function PaginaCatalogo({ categoria, busqueda }) {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let vigente = true;

    async function cargarEventos() {
      try {
        const datos = await cargarCatalogo();
        if (vigente) {
          setEventos(datos);
        }
      } catch (fallo) {
        if (vigente) {
          setError(fallo.message);
        }
      } finally {
        if (vigente) {
          setCargando(false);
        }
      }
    }

    cargarEventos();
    return () => {
      vigente = false;
    };
  }, [recarga]);

  function reintentarCarga() {
    setError("");
    setCargando(true);
    setRecarga(recarga + 1);
  }

  if (cargando) {
    return <EsqueletoEventos vista="catalogo" />;
  }

  if (error) {
    return (
      <section className="catalogo">
        <p role="alert">{error}</p>
        <button onClick={reintentarCarga}>Reintentar</button>
      </section>
    );
  }

  return (
    <CatalogoEventos
      eventos={eventos}
      categoria={categoria}
      busquedaInicial={busqueda}
    />
  );
}

export default PaginaCatalogo;
