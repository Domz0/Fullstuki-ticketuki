import "./MapaRecinto.css";

const pesos = (valor) => "$" + valor.toLocaleString("es-CL");

// Con la prop vista solo se muestra; sin ella, los sectores disponibles son botones.
function MapaRecinto({ sectores, plano, seleccionId, onElegir, vista = false, fechaAgotada = false }) {
  const escala = vista ? 0.7 : 1;
  const filas = plano.filas.map((alto) => `${Math.round(alto * escala)}px`).join(" ");

  return (
    <div className={`mapa ${vista ? "mapa_vista" : ""}`} style={{ gridTemplateRows: filas }}>
      <span className="mapa_acceso" style={{ gridColumn: plano.accesoCol, gridRow: "1" }}>
        {plano.acceso}
      </span>
      {sectores.map((sector) => {
        const posicion = plano.posiciones[sector.id];
        const agotada = sector.estado === "agotada" || fechaAgotada;
        const clicable = !vista && !agotada;
        const Caja = clicable ? "button" : "div";
        const propiedades = clicable
          ? {
              type: "button",
              "aria-label": `${sector.nombre}, ${pesos(sector.precio)}`,
              "aria-pressed": seleccionId === sector.id,
              onClick: () => onElegir(sector.id),
            }
          : {};
        return (
          <Caja
            key={sector.id}
            className={`mapa_sector ${agotada ? "mapa_sector_agotada" : ""} ${seleccionId === sector.id ? "is-activo" : ""}`}
            style={{ gridColumn: posicion.col, gridRow: posicion.fila }}
            {...propiedades}
          >
            <span className="mapa_nombre">{sector.nombre}</span>
            <span className="mapa_nombre mapa_nombre_corto">{posicion.corto}</span>
            <span className="mapa_precio">{agotada ? "Agotada" : pesos(sector.precio)}</span>
          </Caja>
        );
      })}
    </div>
  );
}

export default MapaRecinto;
