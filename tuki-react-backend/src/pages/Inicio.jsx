import EsqueletoEventos from "../components/EsqueletoEventos";
import Portada from "../components/Portada";
import Evento from "../components/Evento";
import { useEffect, useState } from "react";
import { cargarCatalogo } from "../services/eventos";

function Inicio() {
  const [catalogo, setCatalogo] = useState([]);
  const [estado, setEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    let vigente = true;
    cargarCatalogo().then(eventos => {
      if (vigente) { setCatalogo(eventos); setEstado(""); }
    }).catch(error => { if (vigente) setEstado(error.message); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, []);
  if (cargando) return <EsqueletoEventos />;
  const nombres = [
    "Festival de rock en vivo",
    "Concierto de música electrónica",
    "Obra de teatro clásica",
    "Clásico de fútbol local",
    "Feria del libro",
    "Expo tecnología y videojuegos",
    "Ballet contemporáneo",
    "Torneo de tenis internacional",
  ];
  const categorias = {
    musica: "Música",
    artes: "Artes y Teatro",
    deportes: "Deportes",
    ferias: "Ferias & Expos",
  };
  const eventos = nombres
    .map((nombre) => catalogo.find((item) => item.nombre === nombre))
    .filter(Boolean);
  const destacado = catalogo
    .filter(evento => evento.categoria === "musica" && evento.ventaHabilitada)
    .sort((a, b) => (a.fechaInicio || "").localeCompare(b.fechaInicio || ""))[0];
  return (
    <>
      {destacado && <Portada evento={destacado} />}
      <section
        className="inicio_eventos"
        aria-labelledby="inicio_eventos_titulo"
      >
        <h2 id="inicio_eventos_titulo">Próximos eventos</h2>
        {estado && <p role="status">{estado}</p>}
        <div className="eventos_contenedor">
          {eventos.map((evento) => (
            <Evento
              key={evento.id}
              evento={{
                ...evento,
                categoria: categorias[evento.categoria],
                fecha: evento.detalle.split(" · ").slice(1).join(" · "),
                enlace: `#/evento/${evento.id}`,
              }}
            />
          ))}
        </div>
      </section>
    </>
  );
}
export default Inicio;
