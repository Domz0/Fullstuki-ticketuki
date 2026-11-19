import { useEffect, useRef, useState } from "react";
import PasosCompra from "../components/PasosCompra";
import { cargarPerfil } from "../utils/sesion";
import { cargarMisEntradas } from "../services/entradas";
import { buscarDestinatario, regalarEntrada } from "../services/transferencias";
import "./PaginaTransferir.css";

const pasos = [
  { id: "entrada", nombre: "Entrada" },
  { id: "destinatario", nombre: "Destinatario" },
  { id: "confirmacion", nombre: "Confirmación" },
];

function PaginaTransferir({ usuario }) {
  const [paso, setPaso] = useState("entrada");
  const [entradas, setEntradas] = useState([]);
  const [entrada, setEntrada] = useState(null);
  const [correo, setCorreo] = useState("");
  const [destinatario, setDestinatario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [buscando, setBuscando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const consultaBusqueda = useRef(null);
  const envioBloqueado = useRef(false);
  const titulo = useRef(null);

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarEntradasTransferibles() {
      try {
        const perfil = await cargarPerfil();
        if (controlador.signal.aborted) return;

        const datos = await cargarMisEntradas(perfil.rut, controlador.signal);
        if (controlador.signal.aborted) return;

        const transferibles = datos.filter(entrada => entrada.transferible);
        setEntradas(transferibles);
      } catch (fallo) {
        if (!controlador.signal.aborted) {
          setError(fallo.message);
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarEntradasTransferibles();
    return () => {
      controlador.abort();
      consultaBusqueda.current?.abort();
    };
  }, [usuario.usuarioId, recarga]);

  useEffect(() => {
    titulo.current?.focus();
  }, [paso, exito, enviando]);

  function reintentarCarga() {
    setError("");
    setCargando(true);
    setRecarga(recarga + 1);
  }

  function cambiarCorreo(evento) {
    consultaBusqueda.current?.abort();
    setBuscando(false);
    setCorreo(evento.target.value);
    setDestinatario(null);
    setError("");
  }

  function elegirEntrada() {
    consultaBusqueda.current?.abort();
    setBuscando(false);
    setError("");
    setPaso("entrada");
  }

  function elegirDestinatario() {
    setError("");
    setPaso("destinatario");
  }

  function revisarTransferencia() {
    setError("");
    setPaso("confirmacion");
  }

  async function buscar(evento) {
    evento.preventDefault();
    consultaBusqueda.current?.abort();

    const controlador = new AbortController();
    consultaBusqueda.current = controlador;
    setError("");
    setDestinatario(null);

    const formatoCorreo = /^[^\s@]+@(duoc\.cl|gmail\.com|duocuc\.cl|profesor\.duoc\.cl)$/i;
    if (!formatoCorreo.test(correo.trim())) {
      setBuscando(false);
      setError("Ingresa un correo de duoc.cl, gmail.com, duocuc.cl o profesor.duoc.cl.");
      return;
    }

    setBuscando(true);

    try {
      const encontrado = await buscarDestinatario(correo, controlador.signal);
      if (controlador.signal.aborted) return;

      if (encontrado.id === usuario.usuarioId) {
        setError("No puedes transferirte una entrada a ti mismo.");
        return;
      }

      setDestinatario(encontrado);
    } catch (fallo) {
      if (!controlador.signal.aborted) {
        setError(fallo.message);
      }
    } finally {
      if (!controlador.signal.aborted) {
        setBuscando(false);
      }
    }
  }

  function mostrarErrorTransferencia(fallo) {
    setError(fallo.message + " Si hubo un problema de conexión, revisa Mis entradas antes de volver a confirmar.");
  }

  async function confirmar() {
    if (envioBloqueado.current) return;

    envioBloqueado.current = true;
    setEnviando(true);
    setError("");

    try {
      // le ponemos color con 9 segundos de espera
      const resultados = await Promise.allSettled([
        regalarEntrada(entrada, destinatario),
        new Promise(resolve => setTimeout(resolve, 900)),
      ]);
      const resultadoTransferencia = resultados[0];

      if (resultadoTransferencia.status === "rejected") {
        mostrarErrorTransferencia(resultadoTransferencia.reason);
        return;
      }

      setExito(true);
    } catch (fallo) {
      // la seson puede caducar antes del envio
      mostrarErrorTransferencia(fallo);
    } finally {
      setEnviando(false);
      envioBloqueado.current = false;
    }
  }

  if (enviando) {
    return (
      <section className="transferir transferir_procesando" role="status" aria-live="polite">
        <span className="transferir_spinner" aria-hidden="true" />
        <h1 ref={titulo} tabIndex={-1}>Transfiriendo tu entrada</h1>
        <p>Actualizando el titular de tu entrada…</p>
      </section>
    );
  }

  const eligiendoEntrada = !exito && paso === "entrada";
  const eligiendoDestinatario = !exito && paso === "destinatario";
  const confirmandoTransferencia = !exito && paso === "confirmacion";
  const listaCargada = !cargando && !error;

  return (
    <section className="transferir">
      <PasosCompra etapa={paso} pasos={pasos} etiqueta="Progreso de la transferencia" />
      <h1 ref={titulo} tabIndex={-1}>
        {exito ? "Entrada transferida" : "Transferir entrada"}
      </h1>

      {exito && (
        <div className="transferir_resumen" role="status">
          <h2>{entrada.nombre}</h2>
          <p>La entrada ahora pertenece a {destinatario.nombre} ({destinatario.correo}).</p>
          <p>El destinatario puede verla en “Mis entradas” al iniciar sesión. Ya no aparecerá entre tus entradas.</p>
        </div>
      )}

      {eligiendoEntrada && (
        <>
          <p>Elige una entrada vigente para regalar.</p>

          {cargando && (
            <div className="transferir_esqueleto" role="status" aria-label="Cargando tus entradas">
              <div aria-hidden="true">
                {[0, 1, 2].map(numero => (
                  <div className="transferir_opcion" key={numero}>
                    <span className="transferir_placeholder transferir_placeholder_radio" />
                    <div className="transferir_placeholder_textos">
                      <span className="transferir_placeholder transferir_placeholder_titulo" />
                      <span className="transferir_placeholder" />
                      <span className="transferir_placeholder transferir_placeholder_corto" />
                    </div>
                  </div>
                ))}
                <div className="transferir_placeholder transferir_placeholder_boton" />
              </div>
            </div>
          )}

          {!cargando && error && (
            <button className="transferir_boton" onClick={reintentarCarga}>
              Volver a cargar entradas
            </button>
          )}

          {listaCargada && entradas.length === 0 && (
            <p>No tienes entradas disponibles para transferir. Las entradas usadas, canceladas o de eventos pasados no se pueden regalar.</p>
          )}

          {listaCargada && entradas.length > 0 && (
            <>
              <fieldset className="transferir_lista">
                <legend>Selecciona una entrada</legend>
                {entradas.map(item => (
                  <label
                    className={"transferir_opcion " + (entrada?.id === item.id ? "is-activa" : "")}
                    key={item.id}
                  >
                    <input
                      type="radio"
                      name="entrada"
                      checked={entrada?.id === item.id}
                      onChange={() => setEntrada(item)}
                    />
                    <span>
                      <strong>{item.nombre}</strong>
                      <span>{item.fecha} · {item.sector}</span>
                      <small>Entrada {item.codigo}</small>
                    </span>
                  </label>
                ))}
              </fieldset>
              <button className="transferir_boton principal" disabled={!entrada} onClick={elegirDestinatario}>
                Continuar
              </button>
            </>
          )}
        </>
      )}

      {eligiendoDestinatario && (
        <>
          <form className="transferir_formulario" onSubmit={buscar}>
            <div className="transferir_campo">
              <label htmlFor="destinatario_correo">Correo del destinatario</label>
              <input
                id="destinatario_correo"
                type="email"
                required
                maxLength={100}
                value={correo}
                onChange={cambiarCorreo}
                placeholder="nombre@duoc.cl"
              />
            </div>
            <p className="transferir_nota">Escribe el correo completo del perfil de la persona que recibirá la entrada.</p>
            <button className="transferir_boton principal" disabled={buscando}>
              {buscando ? "Buscando…" : "Buscar destinatario"}
            </button>
          </form>

          {destinatario && (
            <div className="transferir_resumen">
              <h2>{destinatario.nombre}</h2>
              <p>{destinatario.correo}</p>
              <button className="transferir_boton principal" onClick={revisarTransferencia}>
                Elegir destinatario
              </button>
            </div>
          )}

          <button className="transferir_boton" onClick={elegirEntrada}>
            Volver a elegir entrada
          </button>
        </>
      )}

      {confirmandoTransferencia && (
        <>
          <div className="transferir_resumen">
            <h2>Revisa la transferencia</h2>
            <strong>{entrada.nombre}</strong>
            <p>{entrada.fecha} · {entrada.sector}</p>
            <p>Entrada {entrada.codigo}</p>
            <h2>Recibe</h2>
            <p>{destinatario.nombre}</p>
            <p>{destinatario.correo}</p>
          </div>
          <p className="transferir_nota">Al confirmar, la entrada dejará de estar a tu nombre y aparecerá en la cuenta del destinatario.</p>
          <button className="transferir_boton principal" onClick={confirmar}>
            Confirmar transferencia
          </button>
          <button className="transferir_boton" onClick={elegirDestinatario}>
            Cambiar destinatario
          </button>
        </>
      )}

      {!exito && error && <p role="alert" className="txt_error">{error}</p>}
      <a className="transferir_volver" href="#/cuenta/entradas">
        <span aria-hidden="true">←</span> Volver a mis entradas
      </a>
    </section>
  );
}

export default PaginaTransferir;
