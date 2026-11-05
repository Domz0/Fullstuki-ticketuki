import PasosCompra from "./PasosCompra";
import SeleccionEntradas from "./SeleccionEntradas";
import "./ElegirEntradas.css";

function ElegirEntradas({ evento, seleccion, fechaElegida, sectores, onElegir, onCambiarCantidad, onContinuar }) {
  const fecha = fechaElegida;
  return (
    <section className="elegir_entradas" aria-labelledby="elegir_entradas_titulo">
      <PasosCompra etapa="entradas" />
      <header className="cabeza">
        <h2 id="elegir_entradas_titulo" className="cabeza_titulo">{evento.nombre}</h2>
        <p className="cabeza_detalle">{fecha.dia} {fecha.mes} · {fecha.horario} · {evento.recinto}</p>
      </header>
      <div className="entradas_columnas">
        <section className="plano" aria-label="Elegir sector">
          <div className="plano_pendiente">
            <button className="boton plano_simular" type="button"
              disabled={fecha.estado === "Agotado"}
              onClick={() => {
                const sector = sectores.find((item) => item.estado !== "agotada");
                if (sector) onElegir(sector.id);
              }}>
              falta agregar
            </button>
          </div>
          <p className="plano_nota">Selección por área. La ubicación exacta dentro del área se asigna al ingresar al recinto.</p>
        </section>
        <SeleccionEntradas seleccion={seleccion} cantidad={seleccion?.cantidad || 1}
          onCambiarCantidad={onCambiarCantidad} onContinuar={onContinuar}>
          <div className="seleccion_sectores">
            {sectores.map((sector) => (
              <button key={sector.id} className="seleccion_sector" type="button"
                disabled={sector.estado === "agotada" || fecha.estado === "Agotado"}
                aria-pressed={seleccion?.sectorId === sector.id}
                onClick={() => onElegir(sector.id)}>
                <span>{sector.nombre}</span>
                <strong>{sector.estado === "agotada" || fecha.estado === "Agotado" ? "Agotado" : "$" + sector.precio.toLocaleString("es-CL")}</strong>
              </button>
            ))}
          </div>
        </SeleccionEntradas>
      </div>
    </section>
  );
}
export default ElegirEntradas;
