import Portada from "../components/Portada";
import Evento from "../components/Evento";
import { catalogo } from "../data/catalogo";

function Inicio() {
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
  return (
    <>
      <Portada />
      <section
        className="inicio_eventos"
        aria-labelledby="inicio_eventos_titulo"
      >
        <h2 id="inicio_eventos_titulo">Próximos eventos</h2>
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
