import { navegar } from "../utils/navegacion";
import { useEffect, useState } from "react";
import { cargarMisEntradas } from "../services/entradas";
import "./MisEntradas.css";

function MisEntradas({ usuario }) {
  const [consulta, setConsulta] = useState({ entradas: [], cargando: true, error: "" });
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    const controlador = new AbortController();
    cargarMisEntradas(usuario.rut, controlador.signal).then(entradas => {
      if (!controlador.signal.aborted) setConsulta({ entradas, cargando: false, error: "" });
    }).catch(error => {
      if (!controlador.signal.aborted) setConsulta({ entradas: [], cargando: false, error: error.message });
    });
    return () => controlador.abort();
  }, [usuario.rut, intento]);
  function recargar() {
    setConsulta({ entradas: [], cargando: true, error: "" });
    setIntento(valor => valor + 1);
  }
  const { entradas, cargando, error } = consulta;
  const [filtro, setFiltro] = useState("proximas");
  const visibles = entradas.filter((entrada) => entrada.estado === filtro);

  return (
    <section
      className="cuenta_contenido mis_entradas"
      aria-labelledby="mis_entradas_titulo"
    >
      <h3 id="mis_entradas_titulo" className="cuenta_titulo">
        Mis entradas
      </h3>
      <button className="boton" type="button" onClick={recargar} disabled={cargando}>Actualizar entradas</button>
      {cargando && <p role="status">Cargando tus entradas…</p>}
      {error && <p role="alert">{error}</p>}
      {!cargando && !error && entradas.some(entrada => entrada.detalleIncompleto) &&
        <p role="status">Tus entradas están disponibles, pero no se pudieron cargar algunos datos de los eventos. Puedes volver a actualizar.</p>}
      <div className="filtros" role="group" aria-label="Filtrar entradas">
        {[
          { id: "proximas", nombre: "Próximas" },
          { id: "pasadas", nombre: "Pasadas" },
          { id: "canceladas", nombre: "Canceladas" },
          { id: "otras", nombre: "Otras" },
        ].map((opcion) => (
          <button
            key={opcion.id}
            className={`filtro ${filtro === opcion.id ? "is-activo" : ""}`}
            type="button"
            aria-pressed={filtro === opcion.id}
            onClick={() => setFiltro(opcion.id)}
          >
            {opcion.nombre} ({entradas.filter(entrada => entrada.estado === opcion.id).length})
          </button>
        ))}
      </div>
      <ul className="lista">
        {visibles.map((entrada) => (
          <li
            key={entrada.id}
            className={`entrada ${entrada.estado !== "proximas" ? "entrada_cerrada" : ""}`}
          >
            <div className="entrada_datos">
              <p className="entrada_rotulo">{entrada.rotulo}</p>
              <h4 className="entrada_titulo">{entrada.nombre}</h4>
              <p className="entrada_recinto">{entrada.recinto}</p>
              <p className="entrada_fecha">{entrada.fecha}</p>
              <p className="entrada_sector">{entrada.sector}</p>
              <p className="entrada_fecha">Titular: {entrada.titular}</p>
              <p className="entrada_fecha">Orden: {entrada.orden} · 1 entrada</p>
            </div>
            <div className="entrada_acceso">
              <div className="entrada_codigo_caja">
                <p className="entrada_rotulo entrada_rotulo_codigo">Código</p>
                <p className="entrada_codigo">{entrada.codigo}</p>
              </div>
            </div>
            <div className="entrada_acciones">
              <button
                type="button"
                className="boton entrada_detalle"
                onClick={() =>
                  navegar(
                    `/evento/${entrada.eventoId}`,
                  )
                }
              >
                Ver detalle
              </button>
            </div>
          </li>
        ))}
      </ul>
      {!cargando && !error && visibles.length === 0 && (
        <p className="vacio">No tienes entradas en esta sección.</p>
      )}
    </section>
  );
}

export default MisEntradas;
