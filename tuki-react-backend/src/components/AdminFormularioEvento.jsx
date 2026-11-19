import { useEffect, useRef, useState } from "react";
import { apiAdmin, estadosEvento, hoyChile, pesos } from "../services/admin";
import { useAdminDatos } from "../hooks/useAdminDatos";
import { categorias } from "../utils/eventos";
import { EstadoAdmin } from "./AdminVentas";

export function EditarEventoReal({ id }) {
  const consulta = useAdminDatos(`/eventos/${id}`);
  return consulta.datos ? <AdminFormularioEvento key={id} evento={consulta.datos} /> : <EstadoAdmin consulta={consulta} />;
}

export default function AdminFormularioEvento({ evento }) {
  const recintos = useAdminDatos("/recintos");
  const [datos, setDatos] = useState(() => ({ nombre_evento: evento?.nombre_evento || "", categoria: evento?.categoria || "musica",
    subcategoria: evento?.subcategoria || "", ciudad: evento?.ciudad || "", recinto_id_recinto: evento?.recinto_id_recinto || "",
    fecha_evento: evento?.fecha_evento || "", horario: evento?.horario || "", descripcion: evento?.descripcion || "",
    participantes: evento?.participantes || "", estado_evento_id_estado: evento?.estado_evento_id_estado || 1 }));
  const [sectores, setSectores] = useState([]);
  const [cargandoSectores, setCargandoSectores] = useState(Boolean(evento));
  const [errorSectores, setErrorSectores] = useState("");
  const [intento, setIntento] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(null);
  const bloqueo = useRef(false);

  useEffect(() => {
    if (!datos.recinto_id_recinto) return;
    const controlador = new AbortController();
    const ruta = evento ? `/eventos/${evento.id_evento}/sectores` : `/sectores/recinto/${datos.recinto_id_recinto}`;
    apiAdmin(ruta, { signal: controlador.signal }).then(lista => {
      if (!controlador.signal.aborted) setSectores(lista.map(s => ({ ...s, capacidad: s.capacidad_sector, precio: s.precio_sector })));
    }).catch(fallo => {
      if (!controlador.signal.aborted) setErrorSectores(fallo.message);
    }).finally(() => { if (!controlador.signal.aborted) setCargandoSectores(false); });
    return () => controlador.abort();
  }, [datos.recinto_id_recinto, evento, intento]);

  function cambiar(e) {
    const { name, value } = e.target;
    setDatos(d => ({ ...d, [name]: value })); setError(""); setGuardado(null);
    if (name === "recinto_id_recinto") { setSectores([]); setErrorSectores(""); setCargandoSectores(Boolean(value)); }
  }
  function sectorValor(id, campo, valor) {
    setSectores(lista => lista.map(s => s.id_sector === id ? { ...s, [campo]: valor } : s)); setGuardado(null);
  }
  async function guardar(e) {
    e.preventDefault();
    if (bloqueo.current) return;
    const recinto = recintos.datos?.find(r => r.id_recinto === Number(datos.recinto_id_recinto));
    if (!recinto || cargandoSectores || errorSectores) { setError("Carga el recinto y sus sectores antes de guardar."); return; }
    if (!evento && sectores.reduce((s, item) => s + Number(item.capacidad), 0) <= 0) { setError("Debes habilitar al menos un cupo."); return; }
    bloqueo.current = true; setGuardando(true); setError(""); setGuardado(null);
    try {
      const body = { ...datos, recinto_id_recinto: Number(datos.recinto_id_recinto), recinto_catalogo: recinto.nombre_recinto,
        estado_evento_id_estado: Number(datos.estado_evento_id_estado),
        ...(!evento ? { sectores: sectores.map(s => ({ sector_id: s.id_sector, capacidad: Number(s.capacidad), precio: Number(s.precio) })) } : {}) };
      const resultado = await apiAdmin(evento ? `/eventos/${evento.id_evento}` : "/eventos", { method: evento ? "PUT" : "POST", body });
      setGuardado(resultado);
      try { sessionStorage.removeItem("catalogoBackend"); } catch { /* El catálogo se recarga desde la API. */ }
    } catch (fallo) { setError(fallo.message); }
    finally { setGuardando(false); bloqueo.current = false; }
  }
  function campo(nombre, etiqueta, tipo = "text", opciones, extra = {}) {
    return <label className="admin_campo">{etiqueta}{opciones ? <select name={nombre} value={datos[nombre]} onChange={cambiar} required {...extra}>
      <option value="">Selecciona una opción</option>{opciones.map(([id, texto]) => <option key={id} value={id}>{texto}</option>)}
    </select> : <input name={nombre} type={tipo} value={datos[nombre]} onChange={cambiar} required {...extra} />}</label>;
  }
  return <section><h1>{evento ? "Editar evento" : "Crear evento"}</h1><EstadoAdmin consulta={recintos} />
    {recintos.datos && <form className="admin_formulario" onSubmit={guardar}>
      <fieldset disabled={guardando || Boolean(guardado && !evento)} className="admin_campos">
        {campo("nombre_evento", "Nombre del evento", "text", null, { maxLength: 100 })}
        <div className="admin_fila">
          {campo("categoria", "Categoría", "text", Object.entries(categorias))}
          {campo("subcategoria", "Subcategoría", "text", null, { maxLength: 50 })}
          {campo("recinto_id_recinto", "Recinto", "text", recintos.datos.map(r => [r.id_recinto, r.nombre_recinto]), { disabled: Boolean(evento) })}
          {campo("ciudad", "Ciudad", "text", null, { maxLength: 50 })}
          {campo("fecha_evento", "Fecha", "date", null, { min: evento ? undefined : hoyChile() })}
          {campo("horario", "Hora", "time")}
          {campo("estado_evento_id_estado", "Estado", "text", Object.entries(estadosEvento))}
          {campo("participantes", "Participantes (opcional)", "text", null, { required: false, maxLength: 500 })}
        </div>
        <label className="admin_campo">Descripción<textarea name="descripcion" maxLength={500} value={datos.descripcion} onChange={cambiar} required /></label>
        <div className="admin_tarjeta"><h2>Sectores, cupos y precios</h2>
          {evento && <p>El recinto, los cupos y los precios se conservan para respetar las ventas y reservas existentes.</p>}
          {cargandoSectores ? <p role="status">Cargando sectores…</p> : errorSectores ? <><p role="alert">{errorSectores}</p><button type="button" onClick={() => {
            setErrorSectores(""); setCargandoSectores(true); setIntento(i => i + 1);
          }}>Reintentar</button></> : sectores.length === 0 ? <p>Selecciona un recinto con sectores configurados.</p> : <>
            <div className="admin_tabla_contenedor"><table className="admin_tabla"><thead><tr><th>Sector</th><th>Cupos</th><th>Precio por entrada</th></tr></thead>
              <tbody>{sectores.map(s => <tr key={s.id_sector}><td>{s.nombre_sector}</td><td>{evento ? s.capacidad : <input aria-label={`Cupos ${s.nombre_sector}`} type="number" required min="0" max={s.capacidad_sector} step="1" value={s.capacidad} onChange={e => sectorValor(s.id_sector, "capacidad", e.target.value)} />}</td>
                <td>{evento ? pesos(s.precio) : <input aria-label={`Precio ${s.nombre_sector}`} type="number" required min="0" max="2147483647" step="1" value={s.precio} onChange={e => sectorValor(s.id_sector, "precio", e.target.value)} />}</td></tr>)}</tbody></table></div>
            <p>Capacidad total: {sectores.reduce((s, item) => s + Number(item.capacidad), 0)} cupos. Los precios son netos; se agregan IVA y cargo por servicio al comprar.</p>
          </>}
        </div>
        <button className="admin_guardar" disabled={cargandoSectores || Boolean(errorSectores) || sectores.length === 0}>{guardando ? "Guardando…" : evento ? "Guardar cambios" : "Crear evento"}</button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
      {guardado && <p role="status">Evento guardado. <a href={`#/evento/${guardado.id_evento}`}>Ver evento</a></p>}
      <a href="#/admin/eventos">Volver a gestionar eventos</a>
    </form>}
  </section>;
}
