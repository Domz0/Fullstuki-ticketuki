import "./Portada.css";
import "./Evento.css";
import "./CatalogoEventos.css";
import "./DetalleEvento.css";
import "./EsqueletoEventos.css";

function Bloque({ className = "" }) {
  return <div className={`esqueleto_bloque ${className}`} />;
}

function Texto() {
  return <div className="esqueleto_textos">
    <Bloque className="esqueleto_titulo" />
    <Bloque />
    <Bloque className="esqueleto_corto" />
  </div>;
}

export default function EsqueletoEventos({ vista = "inicio" }) {
  const aviso = <span className="esqueleto_aviso" role="status">Cargando {vista === "detalle" ? "evento y disponibilidad" : "eventos"}…</span>;

  if (vista === "detalle") return <section className="detalle_evento esqueleto">
    {aviso}
    <div aria-hidden="true">
      <Bloque className="trailer" />
      <div className="evento_columnas">
        <div className="evento_principal">
          <Texto />
          <div className="fichas">{[0, 1, 2].map(i => <div className="ficha" key={i}><Texto /></div>)}</div>
          <div className="esqueleto_seccion"><Texto /><Bloque className="esqueleto_fecha" /></div>
          <div className="esqueleto_seccion"><Bloque className="esqueleto_mapa" /></div>
        </div>
        <div className="reserva"><Texto /><Bloque className="esqueleto_boton" /><Texto /></div>
      </div>
    </div>
  </section>;

  if (vista === "catalogo") return <section className="catalogo esqueleto">
    {aviso}
    <div aria-hidden="true">
      <Bloque className="esqueleto_titulo esqueleto_corto" />
      <div className="listado">
        <div id="catalogo_panel" className="esqueleto_filtros">{[0, 1, 2, 3].map(i => <Texto key={i} />)}</div>
        <div className="listado_columna">
          <div className="resultados_barra"><Bloque className="esqueleto_corto" /></div>
          <div className="resultados">{[0, 1, 2, 3].map(i => <div className="resultado" key={i}>
            <Bloque className="resultado_imagen" /><div className="resultado_cuerpo"><Texto /></div>
            <div className="resultado_compra"><Bloque className="esqueleto_boton" /></div>
          </div>)}</div>
        </div>
      </div>
    </div>
  </section>;

  return <div className="esqueleto">
    {aviso}
    <div aria-hidden="true">
      <div className="portada"><Bloque className="esqueleto_portada" /><div className="portada_texto"><Texto /><Bloque className="esqueleto_boton esqueleto_corto" /></div></div>
      <section className="inicio_eventos">
        <h2>Próximos eventos</h2>
        <div className="eventos_contenedor">{Array.from({ length: 8 }, (_, i) => <div className="tarjeta" key={i}>
          <Bloque className="tarjeta_imagen" /><div className="tarjeta_cuerpo"><Texto /><div className="tarjeta_pie"><Bloque className="esqueleto_corto" /></div></div>
        </div>)}</div>
      </section>
    </div>
  </div>;
}
