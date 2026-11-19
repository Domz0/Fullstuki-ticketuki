import { useEffect, useRef, useState } from "react";
import { peticionApi } from "../services/api";
import { eventoConcluido } from "../utils/estadoEvento";
import { navegar } from "../utils/navegacion";

const normalizar = texto => (texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export default function BuscadorEventos() {
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const [consulta, setConsulta] = useState({ eventos: [], cargando: false, error: "" });
  const controlador = useRef(null);
  const lista = useRef(null);
  const texto = normalizar(busqueda);
  const resultados = consulta.eventos.filter(e => !eventoConcluido(e) && texto.split(/\s+/).every(palabra =>
    normalizar([e.nombre_evento, e.participantes, e.recinto_catalogo, e.ciudad].filter(Boolean).join(" ")).includes(palabra)
  )).sort((a, b) => {
    const prioridad = e => normalizar(e.nombre_evento) === texto ? 0 : normalizar(e.nombre_evento).startsWith(texto) ? 1 : 2;
    return prioridad(a) - prioridad(b) || (a.fecha_evento || "").localeCompare(b.fecha_evento || "");
  }).slice(0, 5);
  const mostrar = abierto && Boolean(texto);
  const seleccion = Math.min(activo, Math.max(0, resultados.length - 1));
  const disponibles = !consulta.cargando && !consulta.error && resultados.length > 0;

  useEffect(() => () => controlador.current?.abort(), []);
  useEffect(() => {
    lista.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [seleccion]);

  async function cargar() {
    controlador.current?.abort();
    const abort = new AbortController();
    controlador.current = abort;
    setConsulta({ eventos: [], cargando: true, error: "" });
    try {
      const eventos = await peticionApi("/eventos", { signal: abort.signal });
      if (!Array.isArray(eventos)) throw new Error("No se pudieron cargar las sugerencias.");
      if (!abort.signal.aborted) setConsulta({ eventos, cargando: false, error: "" });
    } catch (error) {
      if (!abort.signal.aborted) setConsulta({ eventos: [], cargando: false, error: error.message });
    }
  }
  function abrirEvento(evento) {
    setAbierto(false); setBusqueda(""); setActivo(0);
    navegar(`/evento/${evento.id_evento}`);
  }
  function buscar(e) {
    e.preventDefault();
    if (disponibles && texto) abrirEvento(resultados[seleccion]);
    else setAbierto(true);
  }
  function teclado(e) {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Escape") { setAbierto(false); e.preventDefault(); }
    if (["ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault(); setAbierto(true);
      if (disponibles) setActivo(abierto ? (seleccion + (e.key === "ArrowDown" ? 1 : -1) + resultados.length) % resultados.length : 0);
    }
  }

  return <form className="buscador" role="search" onSubmit={buscar} onBlur={e => {
    if (!e.currentTarget.contains(e.relatedTarget)) setAbierto(false);
  }}>
    <span className="buscador_lupa" aria-hidden="true" />
    <label htmlFor="buscador-campo" hidden>Buscar eventos</label>
    <input id="buscador-campo" className="buscador_campo" type="search" role="combobox" autoComplete="off"
      aria-autocomplete="list" aria-expanded={mostrar} aria-controls="buscador-resultados"
      aria-activedescendant={mostrar && disponibles ? `sugerencia-${resultados[seleccion].id_evento}` : undefined}
      value={busqueda} onChange={e => { setBusqueda(e.target.value); setActivo(0); setAbierto(true); }}
      onFocus={() => { setAbierto(true); cargar(); }} onKeyDown={teclado}
      placeholder="Busca eventos, artistas, recintos o ciudades" />
    <button type="submit" className="header_buscar">Buscar</button>
    {mostrar && <div className="buscador_desplegable">
      <p className="buscador_estado" role="status">{consulta.cargando ? "Buscando eventos…" : consulta.error || (resultados.length ? `${resultados.length} sugerencias.` : "No encontramos eventos")}</p>
      {consulta.error && <button type="button" className="header_buscar buscador_reintentar" onClick={cargar}>Reintentar</button>}
      <ul id="buscador-resultados" role="listbox" aria-label="Eventos sugeridos" ref={lista}>
        {disponibles && resultados.map((evento, indice) => <li id={`sugerencia-${evento.id_evento}`} key={evento.id_evento}
          role="option" aria-selected={seleccion === indice} className="buscador_sugerencia"
          onPointerDown={e => e.preventDefault()}
          onMouseEnter={() => setActivo(indice)} onClick={() => abrirEvento(evento)}>
          <strong>{evento.nombre_evento}</strong>
          <span>{[evento.fecha_evento, evento.horario, evento.recinto_catalogo, evento.ciudad].filter(Boolean).join(" · ")}</span>
        </li>)}
      </ul>
    </div>}
  </form>;
}
