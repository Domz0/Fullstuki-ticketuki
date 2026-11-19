import { useEffect, useRef, useState } from "react";
import PasosCompra from "../components/PasosCompra";
import { cargarPerfil } from "../utils/sesion";
import { cargarMisEntradas } from "../services/entradas";
import { buscarDestinatario, regalarEntrada } from "../services/transferencias";
import "./PaginaTransferir.css";

const pasos = [{ id: "entrada", nombre: "Entrada" }, { id: "destinatario", nombre: "Destinatario" }, { id: "confirmacion", nombre: "Confirmación" }];

export default function PaginaTransferir({ usuario }) {
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
  const [intento, setIntento] = useState(0);
  const consulta = useRef(null);
  const envio = useRef(false);
  const titulo = useRef(null);

  useEffect(() => {
    const controlador = new AbortController();
    cargarPerfil().then(perfil => cargarMisEntradas(perfil.rut, controlador.signal)).then(datos => {
      if (!controlador.signal.aborted) setEntradas(datos.filter(e => e.transferible));
    }).catch(fallo => {
      if (!controlador.signal.aborted) setError(fallo.message);
    }).finally(() => {
      if (!controlador.signal.aborted) setCargando(false);
    });
    return () => { controlador.abort(); consulta.current?.abort(); };
  }, [usuario.usuarioId, intento]);

  useEffect(() => { titulo.current?.focus(); }, [paso, exito, enviando]);

  async function buscar(event) {
    event.preventDefault();
    consulta.current?.abort();
    const controlador = new AbortController();
    consulta.current = controlador;
    setError(""); setDestinatario(null);
    if (!/^[^\s@]+@(duoc\.cl|gmail\.com|duocuc\.cl|profesor\.duoc\.cl)$/i.test(correo.trim())) {
      setBuscando(false); setError("Ingresa un correo de duoc.cl, gmail.com, duocuc.cl o profesor.duoc.cl."); return;
    }
    setBuscando(true);
    try {
      const encontrado = await buscarDestinatario(correo, controlador.signal);
      if (controlador.signal.aborted) return;
      if (encontrado.id === usuario.usuarioId) throw new Error("No puedes transferirte una entrada a ti mismo.");
      setDestinatario(encontrado);
    } catch (fallo) {
      if (!controlador.signal.aborted) setError(fallo.message);
    } finally {
      if (!controlador.signal.aborted) setBuscando(false);
    }
  }

  async function confirmar() {
    if (envio.current) return;
    envio.current = true;
    setEnviando(true); setError("");
    try {
      const [resultado] = await Promise.allSettled([
        regalarEntrada(entrada, destinatario),
        new Promise(resolve => setTimeout(resolve, 900)),
      ]);
      if (resultado.status === "rejected") throw resultado.reason;
      setExito(true);
    } catch (fallo) {
      setError(`${fallo.message} Si hubo un problema de conexión, revisa Mis entradas antes de volver a confirmar.`);
    } finally { setEnviando(false); envio.current = false; }
  }

  if (enviando) return <section className="transferir transferir_procesando" role="status" aria-live="polite">
    <span className="transferir_spinner" aria-hidden="true" />
    <h1 ref={titulo} tabIndex={-1}>Transfiriendo tu entrada</h1>
    <p>Actualizando el titular de tu entrada…</p>
  </section>;

  return <section className="transferir">
    <PasosCompra etapa={paso} pasos={pasos} etiqueta="Progreso de la transferencia" />
    <h1 ref={titulo} tabIndex={-1}>{exito ? "Entrada transferida" : "Transferir entrada"}</h1>
    {exito ? <div className="transferir_resumen" role="status">
      <h2>{entrada.nombre}</h2><p>La entrada ahora pertenece a {destinatario.nombre} ({destinatario.correo}).</p>
      <p>El destinatario puede verla en “Mis entradas” al iniciar sesión. Ya no aparecerá entre tus entradas.</p>
    </div> : <>
      {paso === "entrada" && <>
        <p>Elige una entrada vigente para regalar.</p>
        {cargando ? <div className="transferir_esqueleto" role="status" aria-label="Cargando tus entradas">
          <div aria-hidden="true">
            {[0, 1, 2].map(i => <div className="transferir_opcion" key={i}>
              <span className="transferir_placeholder transferir_placeholder_radio" />
              <div className="transferir_placeholder_textos">
                <span className="transferir_placeholder transferir_placeholder_titulo" />
                <span className="transferir_placeholder" />
                <span className="transferir_placeholder transferir_placeholder_corto" />
              </div>
            </div>)}
            <div className="transferir_placeholder transferir_placeholder_boton" />
          </div>
        </div> : error ? <button className="transferir_boton" onClick={() => {
          setError(""); setCargando(true); setIntento(i => i + 1);
        }}>Volver a cargar entradas</button> : entradas.length === 0 ? <p>No tienes entradas disponibles para transferir. Las entradas usadas, canceladas o de eventos pasados no se pueden regalar.</p> : <>
          <fieldset className="transferir_lista"><legend>Selecciona una entrada</legend>
            {entradas.map(item => <label className={`transferir_opcion ${entrada?.id === item.id ? "is-activa" : ""}`} key={item.id}>
              <input type="radio" name="entrada" checked={entrada?.id === item.id} onChange={() => setEntrada(item)} />
              <span><strong>{item.nombre}</strong><span>{item.fecha} · {item.sector}</span><small>Entrada {item.codigo}</small></span>
            </label>)}
          </fieldset>
          <button className="transferir_boton principal" disabled={!entrada} onClick={() => { setPaso("destinatario"); setError(""); }}>Continuar</button>
        </>}
      </>}
      {paso === "destinatario" && <>
        <form className="transferir_formulario" onSubmit={buscar}>
          <div className="transferir_campo"><label htmlFor="destinatario_correo">Correo del destinatario</label>
            <input id="destinatario_correo" type="email" required maxLength={100} value={correo} onChange={e => {
              consulta.current?.abort(); setBuscando(false); setCorreo(e.target.value); setDestinatario(null); setError("");
            }} placeholder="nombre@duoc.cl" /></div>
          <p className="transferir_nota">Escribe el correo completo del perfil de la persona que recibirá la entrada.</p>
          <button className="transferir_boton principal" disabled={buscando}>{buscando ? "Buscando…" : "Buscar destinatario"}</button>
        </form>
        {destinatario && <div className="transferir_resumen"><h2>{destinatario.nombre}</h2><p>{destinatario.correo}</p>
          <button className="transferir_boton principal" onClick={() => { setPaso("confirmacion"); setError(""); }}>Elegir destinatario</button></div>}
        <button className="transferir_boton" onClick={() => { consulta.current?.abort(); setBuscando(false); setError(""); setPaso("entrada"); }}>Volver a elegir entrada</button>
      </>}
      {paso === "confirmacion" && <>
        <div className="transferir_resumen"><h2>Revisa la transferencia</h2><strong>{entrada.nombre}</strong>
          <p>{entrada.fecha} · {entrada.sector}</p><p>Entrada {entrada.codigo}</p>
          <h2>Recibe</h2><p>{destinatario.nombre}</p><p>{destinatario.correo}</p></div>
        <p className="transferir_nota">Al confirmar, la entrada dejará de estar a tu nombre y aparecerá en la cuenta del destinatario.</p>
        <button className="transferir_boton principal" disabled={enviando} onClick={confirmar}>{enviando ? "Transfiriendo…" : "Confirmar transferencia"}</button>
        {enviando && <p role="status">Actualizando el titular de tu entrada…</p>}
        <button className="transferir_boton" disabled={enviando} onClick={() => { setPaso("destinatario"); setError(""); }}>Cambiar destinatario</button>
      </>}
      {error && <p role="alert" className="txt_error">{error}</p>}
    </>}
    {!enviando && <a className="transferir_volver" href="#/cuenta/entradas"><span aria-hidden="true">←</span> Volver a mis entradas</a>}
  </section>;
}
