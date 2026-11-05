import { navegar } from "../utils/navegacion";
import { catalogo } from "../data/catalogo";
import { useState } from "react";
import "./MisEntradas.css";

function MisEntradas({ entradas }) {
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
      <div className="filtros" role="group" aria-label="Filtrar entradas">
        {[
          { id: "proximas", nombre: "Próximas" },
          { id: "pasadas", nombre: "Pasadas" },
          { id: "transferidas", nombre: "Transferidas" },
        ].map((opcion) => (
          <button
            key={opcion.id}
            className={`filtro ${filtro === opcion.id ? "is-activo" : ""}`}
            type="button"
            aria-pressed={filtro === opcion.id}
            onClick={() => setFiltro(opcion.id)}
          >
            {opcion.nombre}
          </button>
        ))}
      </div>
      <ul className="lista">
        {visibles.map((entrada) => (
          <li
            key={entrada.codigo}
            className={`entrada ${entrada.estado !== "proximas" ? "entrada_cerrada" : ""}`}
          >
            <div className="entrada_datos">
              <p className="entrada_rotulo">{entrada.rotulo}</p>
              <h4 className="entrada_titulo">{entrada.nombre}</h4>
              <p className="entrada_recinto">{entrada.recinto}</p>
              <p className="entrada_fecha">{entrada.fecha}</p>
              <p className="entrada_sector">{entrada.sector}</p>
            </div>
            <div className="entrada_acceso">
              <div className="qr" aria-hidden="true"></div>
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
                    `/evento/${catalogo.find((evento) => evento.nombre === entrada.nombre)?.id || "destacado"}`,
                  )
                }
              >
                Ver detalle
              </button>
              {entrada.estado === "proximas" && (
                <>
                  <button
                    className="boton"
                    type="button"
                    onClick={() => navegar(`/transferir/${entrada.codigo}`)}
                  >
                    Transferir
                  </button>
                  <button
                    className="boton entrada_revender"
                    type="button"
                    onClick={() => navegar(`/revender/${entrada.codigo}`)}
                  >
                    Revender
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      {visibles.length === 0 && (
        <p className="vacio">No tienes entradas en esta sección.</p>
      )}
    </section>
  );
}

export default MisEntradas;
