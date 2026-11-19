import EsqueletoEventos from "../components/EsqueletoEventos";
import CatalogoEventos from "../components/CatalogoEventos";
import { useEffect, useState } from "react";
import { cargarCatalogo } from "../services/eventos";

function PaginaCatalogo({ categoria, busqueda }) {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    let vigente = true;
    cargarCatalogo().then(datos => {
      if (vigente) setEventos(datos);
    }).catch(error => {
      if (vigente) setError(error.message);
    }).finally(() => {
      if (vigente) setCargando(false);
    });
    return () => { vigente = false; };
  }, [intento]);
  if (cargando) return <EsqueletoEventos vista="catalogo" />;
  if (error) return <section className="catalogo">
    <p role="alert">{error}</p>
    <button onClick={() => { setError(""); setCargando(true); setIntento(intento + 1); }}>Reintentar</button>
  </section>;
  return (
    <CatalogoEventos
      eventos={eventos}
      categoria={categoria}
      busquedaInicial={busqueda}
    />
  );
}

export default PaginaCatalogo;
