import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer_datos">
        <div className="footer_marca">
          <p className="footer_logo">Ticketuki</p>
          <p className="footer_descripcion">
            Venta oficial de entradas para música, artes y teatro, deportes y
            ferias en Chile.
          </p>

          <nav
            className="footer_accesos"
            aria-label="Accesos del pie de página"
          >
            <a className="footer_acceso">Inicio</a>
            <a className="footer_acceso">Eventos</a>
          </nav>
        </div>

        <details className="footer_contacto" open id="footer_contacto">
          <summary className="footer_resumen">Contacto y atención</summary>

          <div className="footer_contacto-cuerpo">
            <div className="footer_columna">
              <p className="footer_encabezado">Contacto</p>

              <p className="footer_rotulo">Correo</p>
              <p className="footer_dato">
                <a>contacto@ticketuki.cl</a>
              </p>

              <p className="footer_rotulo">Teléfono</p>
              <p className="footer_dato">
                <a>+56 2 2612 3400</a>
              </p>

              <p className="footer_rotulo">Dirección</p>
              <p className="footer_dato">
                Av. Apoquindo 4501, oficina 1203, Las Condes, Santiago
              </p>
            </div>

            <div className="footer_columna">
              <p className="footer_encabezado">Atención</p>

              <p className="footer_rotulo">Atención</p>
              <p className="footer_dato">
                Lunes a viernes 9:00-19:00 · Sábado 10:00-14:00
              </p>
              <p className="footer_dato footer_dato--nota">
                Respondemos correos dentro de 24 horas hábiles.
              </p>

              <p className="footer_rotulo">Redes</p>
              <div className="footer_redes">
                <a className="footer_red" aria-label="Instagram de Ticketuki">
                  <svg
                    className="footer_icono"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle
                      cx="17.2"
                      cy="6.8"
                      r="1.2"
                      className="footer_icono-lleno"
                    />
                  </svg>
                  <span className="footer_red-texto">Instagram</span>
                </a>

                <a className="footer_red" aria-label="YouTube de Ticketuki">
                  <svg
                    className="footer_icono"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <rect x="2.5" y="6" width="19" height="12" rx="4" />
                    <path
                      d="M10.5 9.5v5l4.2-2.5z"
                      className="footer_icono-lleno"
                    />
                  </svg>
                  <span className="footer_red-texto">YouTube</span>
                </a>
              </div>
            </div>
          </div>
        </details>
      </div>

      <div className="footer_legal">
        <p className="footer_copyright">
          © 2026 Ticketuki SpA · Santiago, Chile
        </p>

        <p className="footer_seguridad">
          <span className="footer_etiqueta">Compra segura</span>
          Compra solo en ticketuki.cl. No respaldamos entradas de otros canales.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
