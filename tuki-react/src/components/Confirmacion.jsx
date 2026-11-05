import { navegar } from "../utils/navegacion";
import "./Confirmacion.css";

function Confirmacion({ compra }) {
  return (
    <section
      className="flex_V confirmacion"
      aria-labelledby="titulo_confirmacion"
    >
      <header className="flex_V confirmacion_encabezado">
        <h2 id="titulo_confirmacion">Compra confirmada</h2>
        <p className="texto_secundario">
          Vista de ejemplo con datos ficticios. El QR no es una entrada válida.
        </p>
      </header>
      <div className="flex_H panel confirmacion_tarjeta">
        <div className="flex_V confirmacion_acceso">
          <img
            src={compra.qr}
            alt="QR de ejemplo"
            className="flex_centrado qr"
          />
          <dl className="confirmacion_identificador">
            <dt className="texto_small confirmacion_etiqueta">
              CODIGO DE ACCESO
            </dt>
            <dd className="confirmacion_codigo">{compra.codigo}</dd>
          </dl>
          <p className="texto_small">
            Un QR por entrada. Se escanea en el acceso del recinto.
          </p>
        </div>
        <div className="flex_V confirmacion_compra confirmacion_datos">
          <h3>Datos de la compra</h3>
          <dl className="flex_H confirmacion_fila">
            <div className="flex_V confirmacion_campo">
              <dt className="texto_small">COMPRADOR</dt>
              <dd>{compra.comprador.nombre} {compra.comprador.apellido}</dd>
            </div>
            <div className="flex_V confirmacion_campo">
              <dt className="texto_small">CORREO</dt>
              <dd>{compra.comprador.correo}</dd>
            </div>
          </dl>
          <dl className="flex_H confirmacion_fila">
            <div className="flex_V confirmacion_campo">
              <dt className="texto_small">ORDEN</dt>
              <dd>{compra.orden}</dd>
            </div>
            <div className="flex_V confirmacion_campo">
              <dt className="texto_small">EVENTO</dt>
              <dd>{compra.evento}</dd>
            </div>
          </dl>

          <dl className="flex_H confirmacion_fila">
            <div className="flex_V confirmacion_campo">
              <dt className="texto_small">FECHA Y HORA</dt>
              <dd>{compra.fecha}</dd>
            </div>
            <div className="flex_V confirmacion_campo">
              <dt className="texto_small">RECINTO</dt>
              <dd>{compra.recinto}</dd>
            </div>
          </dl>

          <dl className="flex_H confirmacion_fila">
            <div className="flex_V confirmacion_campo">
              <dt className="texto_small">ÁREA</dt>
              <dd>{compra.area}</dd>
            </div>
            <div className="flex_V confirmacion_campo">
              <dt className="texto_small">CANTIDAD</dt>
              <dd>
                {compra.cantidad +
                  (compra.cantidad === 1 ? " entrada" : " entradas")}
              </dd>
            </div>
          </dl>

          <dl className="flex_H confirmacion_fila">
            <div className="flex_V confirmacion_campo">
              <dt className="texto_small">MÉTODO DE PAGO</dt>
              <dd>{compra.metodoPago}</dd>
            </div>
            <div className="flex_V confirmacion_campo">
              <dt className="texto_small">TOTAL PAGADO</dt>
              <dd>{"$" + compra.total.toLocaleString("es-CL")}</dd>
            </div>
          </dl>
          <div className="separador"></div>
          <div className="flex_H botonera">
            <button
              type="button"
              className="boton boton_entradas"
              onClick={() => navegar("/cuenta/entradas")}
            >
              Ver mis entradas
            </button>

            <button
              type="button"
              className="boton boton_home"
              onClick={() => navegar("/inicio")}
            >
              Volver a home
            </button>
          </div>
        </div>
      </div>
      <div className="flex_H panel confirmacion_recomendacion">
        <b className="texto_morado">RECOMENDACION</b>
        <p className="texto_secundario">
          Guarda tu código de acceso. Lo necesitarás para ingresar al evento.
        </p>
      </div>
    </section>
  );
}

export default Confirmacion;
