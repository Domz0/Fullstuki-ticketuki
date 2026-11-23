import { navegar } from "../../utils/navegacion";
import { useEffect, useState } from "react";
import { cargarMisEntradas, devolverEntrada } from "../../services/entradas";
import qrEjemplo from "../../assets/qr-ejemplo.png";
import "./MisEntradas.css";

function MisEntradas({ usuario }) {
  const [entradas, setEntradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  const [devolucion, setDevolucion] = useState(null);
  const [devolviendo, setDevolviendo] = useState(false);
  const [aviso, setAviso] = useState("");
  const [filtro, setFiltro] = useState("proximas");

  const visibles = entradas.filter(entrada => entrada.estado === filtro);
  const detallesIncompletos = entradas.some(entrada => entrada.detalleIncompleto);
  const filtros = [
    { id: "proximas", nombre: "Próximas" },
    { id: "pasadas", nombre: "Pasadas" },
    { id: "canceladas", nombre: "Canceladas" },
    { id: "otras", nombre: "Otras" },
  ];

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarEntradas() {
      try {
        const datos = await cargarMisEntradas(usuario.rut, controlador.signal);
        if (controlador.signal.aborted) return;
        setEntradas(datos);
        setError("");
      } catch (fallo) {
        if (controlador.signal.aborted) return;
        setEntradas([]);
        setError(fallo.message);
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }

    cargarEntradas();
    return () => controlador.abort();
  }, [usuario.rut, intento]);

  function recargar() {
    setEntradas([]);
    setCargando(true);
    setError("");
    setIntento(anterior => anterior + 1);
  }

  function elegirDevolucion(entrada) {
    setDevolucion(entrada);
    setAviso("");
  }

  // despues de devolver una entrada se consulta su nuevo estado
  async function confirmarDevolucion() {
    if (!devolucion || devolviendo) return;
    setDevolviendo(true);
    setAviso("");

    try {
      const resultado = await devolverEntrada(devolucion.id);
      if (resultado.estado === "REEMBOLSADA") {
        setAviso("Entrada devuelta. El cupo está disponible y el reembolso simulado quedó registrado.");
      } else {
        setAviso("Entrada cancelada y cupo liberado. El reembolso simulado está pendiente de registro; se reintentará automáticamente.");
      }
      setDevolucion(null);
      setFiltro("canceladas");
      recargar();
    } catch (fallo) {
      if (fallo.name !== "AbortError") {
        setAviso(`${fallo.message} Actualiza tus entradas antes de reintentar.`);
      }
    } finally {
      setDevolviendo(false);
    }
  }

  return (
    <section
      className="cuenta_contenido mis_entradas"
      aria-labelledby="mis_entradas_titulo"
    >
      <h3 id="mis_entradas_titulo" className="cuenta_titulo">
        Mis entradas
      </h3>
      <button className="boton" type="button" onClick={recargar} disabled={cargando}>Actualizar entradas</button>
      {aviso && <p role="status">{aviso}</p>}
      {devolucion && <section className="entrada_devolucion" aria-label="Confirmar devolución">
        <h4>¿Devolver esta entrada?</h4>
        <p>{devolucion.nombre} · {devolucion.sector} · Código {devolucion.codigo}</p>
        <p>Esta entrada quedará cancelada y su cupo volverá a estar disponible. Se registrará un reembolso simulado del importe pagado por ella, incluido IVA y cargo por servicio. Las demás entradas de la orden no se modificarán.</p>
        <p>La devolución no se puede deshacer y no genera un abono bancario real.</p>
        <div className="entrada_devolucion_botones">
          <button className="boton" disabled={devolviendo} onClick={() => setDevolucion(null)}>Volver</button>
          <button className="boton" disabled={devolviendo} onClick={confirmarDevolucion}>{devolviendo ? "Procesando devolución…" : "Confirmar devolución"}</button>
        </div>
      </section>}
      {cargando && <p role="status">Cargando tus entradas…</p>}
      {error && <p role="alert">{error}</p>}
      {!cargando && !error && detallesIncompletos &&
        <p role="status">Tus entradas están disponibles, pero no se pudieron cargar algunos datos de los eventos. Puedes volver a actualizar.</p>}
      <div className="filtros" role="group" aria-label="Filtrar entradas">
        {filtros.map((opcion) => (
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
              <img className="qr" src={qrEjemplo} alt="QR de ejemplo" />
              <div className="entrada_codigo_caja">
                <p className="entrada_rotulo entrada_rotulo_codigo">Código</p>
                <p className="entrada_codigo">{entrada.codigo}</p>
              </div>
            </div>
            <div className="entrada_acciones">
              {entrada.devolvible && <button className="boton" disabled={devolviendo} onClick={() => elegirDevolucion(entrada)}>Devolver entrada</button>}
              <button
                type="button"
                className="boton entrada_detalle"
                onClick={() => navegar(`/evento/${entrada.eventoId}`)}
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
