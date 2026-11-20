import { useEffect, useRef, useState } from "react";
import { peticionApi } from "../../services/api";
import { eventoConcluido } from "../../utils/estadoEvento";
import { navegar } from "../../utils/navegacion";

function normalizar(texto) {
  return (texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// primero muestra coincidencias exactas y luego nombres que empiezan igual
function prioridad(evento, texto) {
  const nombre = normalizar(evento.nombre_evento);
  if (nombre === texto) return 0;
  if (nombre.startsWith(texto)) return 1;
  return 2;
}

export default function BuscadorEventos() {
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const controlador = useRef(null);
  const lista = useRef(null);

  const texto = normalizar(busqueda);
  const palabras = texto.split(/\s+/);
  const coincidencias = eventos.filter(evento => {
    if (eventoConcluido(evento)) return false;
    const descripcion = [evento.nombre_evento, evento.participantes, evento.recinto_catalogo, evento.ciudad]
      .filter(Boolean)
      .join(" ");
    return palabras.every(palabra => normalizar(descripcion).includes(palabra));
  });
  const resultados = coincidencias.sort((primero, segundo) => {
    const diferencia = prioridad(primero, texto) - prioridad(segundo, texto);
    if (diferencia !== 0) return diferencia;
    return (primero.fecha_evento || "").localeCompare(segundo.fecha_evento || "");
  }).slice(0, 5);

  const mostrar = abierto && Boolean(texto);
  const seleccion = Math.min(activo, Math.max(0, resultados.length - 1));
  const disponibles = !cargando && !error && resultados.length > 0;
  let aviso = "No encontramos eventos";
  if (cargando) {
    aviso = "Buscando eventos…";
  } else if (error) {
    aviso = error;
  } else if (resultados.length > 0) {
    aviso = `${resultados.length} sugerencias.`;
  }

  useEffect(() => {
    return () => controlador.current?.abort();
  }, []);

  useEffect(() => {
    // mantiene visible la sugerencia elegida con las flechas del teclado
    const sugerencia = lista.current?.querySelector('[aria-selected="true"]');
    sugerencia?.scrollIntoView({ block: "nearest" });
  }, [seleccion]);

  async function cargar() {
    controlador.current?.abort();
    const consulta = new AbortController();
    controlador.current = consulta;
    setEventos([]);
    setCargando(true);
    setError("");

    try {
      const datos = await peticionApi("/eventos", { signal: consulta.signal });
      if (consulta.signal.aborted) return;
      if (!Array.isArray(datos)) {
        setError("No se pudieron cargar las sugerencias.");
        return;
      }
      setEventos(datos);
    } catch (fallo) {
      if (!consulta.signal.aborted) setError(fallo.message);
    } finally {
      if (!consulta.signal.aborted) setCargando(false);
    }
  }

  function abrirEvento(evento) {
    setAbierto(false);
    setBusqueda("");
    setActivo(0);
    navegar(`/evento/${evento.id_evento}`);
  }

  function buscar(event) {
    event.preventDefault();
    if (disponibles && texto) {
      abrirEvento(resultados[seleccion]);
    } else {
      setAbierto(true);
    }
  }

  function cambiarBusqueda(event) {
    setBusqueda(event.target.value);
    setActivo(0);
    setAbierto(true);
  }

  function abrirBuscador() {
    setAbierto(true);
    cargar();
  }

  function cerrarAlSalir(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) setAbierto(false);
  }

  function manejarTeclado(event) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape") {
      setAbierto(false);
      event.preventDefault();
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    setAbierto(true);
    if (!disponibles) return;
    if (!abierto) {
      setActivo(0);
      return;
    }

    const direccion = event.key === "ArrowDown" ? 1 : -1;
    const siguiente = (seleccion + direccion + resultados.length) % resultados.length;
    setActivo(siguiente);
  }

  return (
    <form className="buscador" role="search" onSubmit={buscar} onBlur={cerrarAlSalir}>
      <span className="buscador_lupa" aria-hidden="true" />
      <label htmlFor="buscador-campo" hidden>Buscar eventos</label>
      <input
        id="buscador-campo" className="buscador_campo" type="search" role="combobox"
        autoComplete="off" aria-autocomplete="list" aria-expanded={mostrar}
        aria-controls="buscador-resultados"
        aria-activedescendant={mostrar && disponibles ? `sugerencia-${resultados[seleccion].id_evento}` : undefined}
        value={busqueda} onChange={cambiarBusqueda} onFocus={abrirBuscador} onKeyDown={manejarTeclado}
        placeholder="Busca eventos, artistas, recintos o ciudades"
      />
      <button type="submit" className="header_buscar">Buscar</button>
      {mostrar && (
        <div className="buscador_desplegable">
          <p className="buscador_estado" role="status">{aviso}</p>
          {error && (
            <button type="button" className="header_buscar buscador_reintentar" onClick={cargar}>Reintentar</button>
          )}
          <ul id="buscador-resultados" role="listbox" aria-label="Eventos sugeridos" ref={lista}>
            {disponibles && resultados.map((evento, indice) => (
              <li
                id={`sugerencia-${evento.id_evento}`} key={evento.id_evento}
                role="option" aria-selected={seleccion === indice} className="buscador_sugerencia"
                onPointerDown={event => event.preventDefault()}
                onMouseEnter={() => setActivo(indice)} onClick={() => abrirEvento(evento)}
              >
                <strong>{evento.nombre_evento}</strong>
                <span>{[evento.fecha_evento, evento.horario, evento.recinto_catalogo, evento.ciudad].filter(Boolean).join(" · ")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
