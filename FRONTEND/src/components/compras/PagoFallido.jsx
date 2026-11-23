import { navegar } from "../../utils/navegacion";
import "./Confirmacion.css";
import "./PagoFallido.css";

function Campo({ etiqueta, children }) {
  return (
    <div className="flex_V confirmacion_campo">
      <dt className="texto_small">{etiqueta}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function PagoFallido({ compra, requiereNuevaSeleccion, onReintentar }) {
  const tarjetaVencida = compra.motivo === "Tarjeta vencida";
  return (
    <section className="flex_V confirmacion" aria-labelledby="titulo_pago_fallido">
      <header className="flex_V confirmacion_encabezado">
        <h2 id="titulo_pago_fallido">No pudimos procesar tu pago</h2>
        <p className="texto_secundario">
          {tarjetaVencida ? "Tu tarjeta está vencida. " : ""}
        </p>
      </header>
      <div className="flex_H panel confirmacion_tarjeta">
        <div className="flex_V confirmacion_acceso">
          <div className="flex_centrado pago_fallido_icono" aria-hidden="true">✕</div>
          <dl className="confirmacion_identificador">
            <dt className="texto_small confirmacion_etiqueta">ESTADO DEL PAGO</dt>
            <dd className="confirmacion_codigo pago_fallido_estado">RECHAZADO</dd>
          </dl>
          <p className="texto_small">
            {requiereNuevaSeleccion
              ? "Vuelve a elegir tus entradas para consultar los cupos disponibles."
              : "Tu selección se mantiene mientras esté vigente para que puedas intentarlo otra vez."}
          </p>
        </div>
        <div className="flex_V confirmacion_compra confirmacion_datos">
          <h3>Datos de la compra</h3>
          <dl className="flex_H confirmacion_fila">
            <Campo etiqueta="COMPRADOR">{[compra.comprador?.nombre, compra.comprador?.apellido].filter(Boolean).join(" ") || "Sin información"}</Campo>
            <Campo etiqueta="CORREO">{compra.comprador?.correo || "Sin información"}</Campo>
          </dl>
          <dl className="flex_H confirmacion_fila">
            <Campo etiqueta="EVENTO">{compra.evento}</Campo>
            <Campo etiqueta="FECHA Y HORA">{compra.fecha}</Campo>
          </dl>
          <dl className="flex_H confirmacion_fila">
            <Campo etiqueta="RECINTO">{compra.recinto}</Campo>
            <Campo etiqueta="SECTOR">{compra.area}</Campo>
          </dl>
          <dl className="flex_H confirmacion_fila">
            <Campo etiqueta="CANTIDAD">
              {compra.cantidad + (compra.cantidad === 1 ? " entrada" : " entradas")}
            </Campo>
            <Campo etiqueta="MÉTODO DE PAGO">{compra.metodoPago}</Campo>
          </dl>
          <dl className="flex_H confirmacion_fila">
            <Campo etiqueta="MOTIVO">{compra.motivo}</Campo>
            <Campo etiqueta="TOTAL DE LA SELECCIÓN">{"$" + compra.total.toLocaleString("es-CL")}</Campo>
          </dl>
          <div className="separador"></div>
          <div className="flex_H botonera">
            <button type="button" className="boton boton_entradas" onClick={onReintentar}>
              {requiereNuevaSeleccion ? "Volver a elegir entradas" : "Reintentar pago"}
            </button>
            <button type="button" className="boton boton_home" onClick={() => navegar("/inicio")}>
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
      <div className="flex_H panel confirmacion_recomendacion">
        <b className="texto_morado">RECOMENDACIÓN</b>
        <p className="texto_secundario">
          {tarjetaVencida
            ? "Revisa la fecha de vencimiento o usa otra tarjeta."
            : "Revisa el motivo indicado antes de volver a intentarlo."} Tus entradas no quedan compradas hasta completar el pago.
        </p>
      </div>
    </section>
  );
}

export default PagoFallido;
