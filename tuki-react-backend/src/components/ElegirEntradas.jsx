import PasosCompra from "./PasosCompra";
import SeleccionEntradas from "./SeleccionEntradas";
import MapaRecinto from "./MapaRecinto";
import { obtenerPlano } from "../data/sectores";
import "./ElegirEntradas.css";

function ElegirEntradas({ evento, seleccion, fechaElegida, sectores, onElegir, onCambiarCantidad, onContinuar }) {
  const fecha = fechaElegida;
  return (
    <section className="elegir_entradas" aria-labelledby="elegir_entradas_titulo">
      <PasosCompra etapa="entradas" />
      <header className="cabeza">
        <h2 id="elegir_entradas_titulo" className="cabeza_titulo">{evento.nombre}</h2>
        <p className="cabeza_detalle">{fecha.dia} {fecha.mes}{fecha.horario && ` · ${fecha.horario}`} · {evento.recinto}</p>
      </header>
      <div className="entradas_columnas">
        <section className="plano" aria-label="Elegir sector">
          <div className="leyenda">
            <span className="leyenda_item"><span className="leyenda_marca" aria-hidden="true"></span> Disponible</span>
            <span className="leyenda_item"><span className="leyenda_marca leyenda_marca_activa" aria-hidden="true"></span> Seleccionada</span>
            <span className="leyenda_item"><span className="leyenda_marca leyenda_marca_agotada" aria-hidden="true"></span> Agotada</span>
          </div>
          <MapaRecinto
            sectores={sectores}
            plano={obtenerPlano(evento)}
            seleccionId={seleccion?.sectorId}
            onElegir={onElegir}
            fechaAgotada={fecha.estado === "Agotado"}
          />
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
