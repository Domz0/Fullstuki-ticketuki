import { useState } from "react";
import { useAdminDatos } from "../hooks/useAdminDatos";
import { apiAdmin, hoyChile } from "../services/admin";
import { EstadoAdmin } from "./AdminVentas";

export default function AdminCodigos() {
  const eventos = useAdminDatos("/eventos");
  const codigos = useAdminDatos("/compras/codigos");
  const [busqueda, setBusqueda] = useState("");
  const [evento, setEvento] = useState("");
  const [codigo, setCodigo] = useState("");
  const [porcentaje, setPorcentaje] = useState(10);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const disponibles = (eventos.datos || []).filter(e => e.estado_evento_id_estado === 2 && e.fecha_evento >= hoyChile());
  const normalizar = texto => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const encontrados = disponibles.filter(e => normalizar(e.nombre_evento).includes(normalizar(busqueda)) || String(e.id_evento) === evento);
  const nombres = new Map((eventos.datos || []).map(e => [e.id_evento, e.nombre_evento]));
  async function guardar(e) {
    e.preventDefault();
    if (guardando) return;
    setGuardando(true); setMensaje("");
    try {
      await apiAdmin("/compras/codigos", { method: "POST", body: { evento: Number(evento), codigo: codigo.trim().toUpperCase(), porcentaje: Number(porcentaje) } });
      setMensaje("Código creado. Ya se puede utilizar en el pago de este evento.");
      setCodigo(""); codigos.recargar();
    } catch (error) { setMensaje(error.message); }
    finally { setGuardando(false); }
  }
  return <section>
    <h1>Códigos de descuento</h1>
    <p>Elige un evento y crea un descuento porcentual. Se aplica al precio de la entrada antes del IVA y cargo por servicio, hasta la fecha del evento.</p>
    <EstadoAdmin consulta={eventos} />
    {eventos.datos && <form className="admin_formulario admin_tarjeta" onSubmit={guardar}>
      <fieldset className="admin_campos" disabled={guardando}>
        <label className="admin_campo">Buscar evento<input type="search" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre del evento" /></label>
        <label className="admin_campo">Evento<select required value={evento} onChange={e => setEvento(e.target.value)}>
          <option value="">Selecciona un evento</option>
          {encontrados.map(e => <option key={e.id_evento} value={e.id_evento}>{e.nombre_evento} · {e.fecha_evento}</option>)}
        </select></label>
        {!encontrados.length && <p>No hay eventos disponibles que coincidan con la búsqueda.</p>}
        <label className="admin_campo">Código<input required minLength={3} maxLength={30} pattern="[A-Za-z0-9_\-]{3,30}" value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())} placeholder="Ejemplo: MUSICA15" /></label>
        <small>Entre 3 y 30 caracteres: letras, números, guion o guion bajo. No se distinguen mayúsculas.</small>
        <label className="admin_campo">Descuento (%)<input required type="number" min="1" max="100" step="1" value={porcentaje} onChange={e => setPorcentaje(e.target.value)} /></label>
      </fieldset>
      <button className="admin_boton admin_boton_principal" disabled={guardando || !evento}>{guardando ? "Guardando…" : "Crear código"}</button>
    </form>}
    <p role="status">{mensaje}</p>
    <h2>Códigos creados</h2>
    <EstadoAdmin consulta={codigos} />
    {codigos.datos?.length === 0 && <p>Todavía no hay códigos de descuento.</p>}
    {!!codigos.datos?.length && <div className="admin_tabla_contenedor"><table className="admin_tabla">
      <thead><tr><th>Código</th><th>Evento</th><th>Descuento</th><th>Vence</th></tr></thead>
      <tbody>{codigos.datos.map(c => <tr key={c.codigo}><td><strong>{c.codigo}</strong></td><td>{nombres.get(c.evento_id) || `Evento #${c.evento_id}`}</td><td>{c.descuento}%</td><td>{c.fecha_expiracion}</td></tr>)}</tbody>
    </table></div>}
  </section>;
}
