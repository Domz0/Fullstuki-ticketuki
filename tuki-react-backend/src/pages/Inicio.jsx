import { useEffect, useState } from "react";
import EsqueletoEventos from "../components/EsqueletoEventos";
import Portada from "../components/Portada";
import Evento from "../components/Evento";
import { cargarCatalogo } from "../services/eventos";

// carga catalogo y los eventos de inicio
function Inicio() {
  const [catalogo, setCatalogo] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;

    async function cargarEventos() {
      try {
        const eventos = await cargarCatalogo();
        if (!vigente) return;

        setCatalogo(eventos);
        setError("");
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

    // ignora si el usuario salio de la pagina
    return () => {
      vigente = false;
    };
  }, []);

  if (cargando) {
    return <EsqueletoEventos />;
  }

  const categorias = {
    musica: "Música",
    artes: "Artes y Teatro",
    deportes: "Deportes",
    ferias: "Ferias & Expos",
  };

  const vigentes = catalogo.filter(evento => evento.ventaHabilitada);
  vigentes.sort((primero, segundo) => {
    const primeraFecha = primero.fechaInicio || "";
    const segundaFecha = segundo.fechaInicio || "";
    return primeraFecha.localeCompare(segundaFecha);
  });

  const proximosEventos = vigentes.slice(0, 8);
  const destacado = vigentes.find(evento => evento.destacado) || vigentes[0];

  function prepararTarjeta(evento) {
    return {
      ...evento,
      categoria: categorias[evento.categoria],
      fecha: evento.detalle.split(" · ").slice(1).join(" · "),
      enlace: "#/evento/" + evento.id,
    };
  }

  return (
    <>
      {destacado && <Portada evento={destacado} />}
      <section className="inicio_eventos" aria-labelledby="inicio_eventos_titulo">
        <h2 id="inicio_eventos_titulo">Próximos eventos</h2>
        {error && <p role="status">{error}</p>}
        <div className="eventos_contenedor">
          {proximosEventos.map(evento => (
            <Evento key={evento.id} evento={prepararTarjeta(evento)} />
          ))}
        </div>
      </section>
    </>
  );
}

export default Inicio;
