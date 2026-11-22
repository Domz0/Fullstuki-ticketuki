import PasosCompra from "../comunes/PasosCompra";
import SeleccionEntradas from "./SeleccionEntradas";
import MapaRecinto from "../eventos/MapaRecinto";
import { obtenerPlano } from "../../data/planosRecintos";
import { textoFecha } from "../../utils/compra";
import "./ElegirEntradas.css";

function ElegirEntradas({ evento, seleccion, fechaElegida, sectores, onElegir, onCambiarCantidad, onContinuar }) {
  const fecha = fechaElegida;

  function precioOEstado(sector) {
    if (sector.capacidad === 0) return "Cerrado";
    if (sector.estado === "agotada") return "Agotado";
    if (sector.bloqueado) return "No disponible";
    return "$" + sector.precio.toLocaleString("es-CL");
  }
  return (
    <section className="elegir_entradas" aria-labelledby="elegir_entradas_titulo">
      <PasosCompra etapa="entradas" />
      <header className="cabeza">
        <h2 id="elegir_entradas_titulo" className="cabeza_titulo">{evento.nombre}</h2>
        <p role="status">Capacidad total: {evento.capacidadTotal} · Entradas disponibles: {evento.disponibles}</p>
        {!evento.ventaHabilitada && <p>{evento.estado}</p>}
        <p className="cabeza_detalle">{textoFecha(fecha)} · {evento.recinto}</p>
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
          <p className="plano_nota">Compra de cupos por sector, sin asientos numerados. La ubicación dentro del sector es libre.</p>
        </section>
        <SeleccionEntradas seleccion={seleccion} cantidad={seleccion?.cantidad || 1}
          onCambiarCantidad={onCambiarCantidad} onContinuar={onContinuar}>
          <div className="seleccion_sectores">
            {sectores.map((sector) => (
              <button key={sector.id} className="seleccion_sector" type="button"
                disabled={sector.bloqueado || sector.estado === "agotada" || fecha.estado === "Agotado"}
                aria-pressed={seleccion?.sectorId === sector.id}
                onClick={() => onElegir(sector.id)}>
                <span>{sector.nombre}<small> · {sector.disponibles} disponibles de {sector.capacidad}</small></span>
                <strong>{precioOEstado(sector)}</strong>
              </button>
            ))}
          </div>
        </SeleccionEntradas>
      </div>
    </section>
  );
}
export default ElegirEntradas;
