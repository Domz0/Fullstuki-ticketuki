import { useEffect, useRef, useState } from "react";
import { useAdminDatos } from "../../hooks/useAdminDatos";
import { apiAdmin, hoyChile } from "../../services/admin";
import { EstadoAdmin } from "./AdminVentas";
import "./AdminCodigos.css";

// deja buscar sin distinguir tildes ni mayuscula
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function AdminCodigos() {
  const eventos = useAdminDatos("/eventos");
  const codigos = useAdminDatos("/compras/codigos");
  const [busqueda, setBusqueda] = useState("");
  const [evento, setEvento] = useState("");
  const [codigo, setCodigo] = useState("");
  const [porcentaje, setPorcentaje] = useState(10);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const lista = useRef(null);

  const listaEventos = eventos.datos || [];
  const disponibles = listaEventos.filter(item =>
    item.estado_evento_id_estado === 2 && item.fecha_evento >= hoyChile(),
  );
  const encontrados = disponibles.filter(item =>
    normalizar(item.nombre_evento).includes(normalizar(busqueda.trim())),
  ).slice(0, 5);
  const seleccion = Math.min(activo, Math.max(0, encontrados.length - 1));
  const elegido = disponibles.find(item => String(item.id_evento) === evento);

  useEffect(() => {
    lista.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [seleccion, abierto]);

  function elegirEvento(item) {
    setEvento(String(item.id_evento));
    setBusqueda(item.nombre_evento);
    setAbierto(false);
    setActivo(0);
  }

  function cambiarBusqueda(event) {
    setBusqueda(event.target.value);
    setEvento("");
    setActivo(0);
    setAbierto(true);
  }

  function manejarTeclado(event) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      // enter elige un evento sin enviar el formulario del código
      event.preventDefault();
      if (encontrados.length > 0) elegirEvento(encontrados[seleccion]);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setAbierto(false);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    setAbierto(true);
    if (!abierto || encontrados.length === 0) {
      setActivo(0);
      return;
    }
    const direccion = event.key === "ArrowDown" ? 1 : -1;
    setActivo((seleccion + direccion + encontrados.length) % encontrados.length);
  }

  function nombreEvento(id) {
    const encontrado = listaEventos.find(item => item.id_evento === id);
    return encontrado?.nombre_evento || `Evento #${id}`;
  }

  async function guardar(event) {
    event.preventDefault();
    if (guardando) return;
    if (!elegido) {
      setMensaje("Selecciona un evento de las sugerencias.");
      return;
    }

    setGuardando(true);
    setMensaje("");
    const datosCodigo = {
      evento: Number(evento),
      codigo: codigo.trim().toUpperCase(),
      porcentaje: Number(porcentaje),
    };

    try {
      await apiAdmin("/compras/codigos", { method: "POST", body: datosCodigo });
      setMensaje("Código creado. Ya se puede utilizar en el pago de este evento.");
      setCodigo("");
      codigos.recargar();
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section>
      <h1>Códigos de descuento</h1>
      <p>Elige un evento y crea un descuento porcentual. Se aplica al precio de la entrada antes del IVA y cargo por servicio, hasta la fecha del evento.</p>
      <EstadoAdmin consulta={eventos} />
      {eventos.datos && (
        <form className="admin_formulario admin_tarjeta" onSubmit={guardar}>
          <fieldset className="admin_campos" disabled={guardando}>
            <div className="admin_selector_evento" onBlur={event => {
              if (!event.currentTarget.contains(event.relatedTarget)) setAbierto(false);
            }}>
              <label className="admin_campo" htmlFor="codigo_buscar_evento">
                Buscar evento
                <input
                  id="codigo_buscar_evento" type="search" role="combobox" autoComplete="off"
                  value={busqueda} onChange={cambiarBusqueda} onFocus={() => setAbierto(true)}
                  onKeyDown={manejarTeclado} placeholder="Escribe el nombre y selecciona un evento"
                  aria-autocomplete="list" aria-expanded={abierto} aria-controls="codigo_eventos"
                  aria-activedescendant={abierto && encontrados.length > 0 ? `codigo_evento_${encontrados[seleccion].id_evento}` : undefined}
                />
              </label>
              {abierto && (
                <div className="admin_eventos_desplegable">
                  <p role="status">
                    {encontrados.length > 0 ? "Selecciona con Enter o haz clic en un evento" : "No hay eventos disponibles que coincidan con la búsqueda"}
                  </p>
                  <ul id="codigo_eventos" role="listbox" aria-label="Eventos disponibles" ref={lista}>
                    {encontrados.map((item, indice) => (
                      <li
                        key={item.id_evento} id={`codigo_evento_${item.id_evento}`}
                        role="option" aria-selected={seleccion === indice}
                        onPointerDown={event => event.preventDefault()}
                        onMouseEnter={() => setActivo(indice)} onClick={() => elegirEvento(item)}
                      >
                        <strong>{item.nombre_evento}</strong>
                        <span>{item.fecha_evento} · {item.recinto_catalogo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {elegido && <p className="admin_evento_elegido" role="status">Evento seleccionado: <strong>{elegido.nombre_evento}</strong> · {elegido.fecha_evento}</p>}
            <label className="admin_campo">
              Código
              <input
                required minLength={3} maxLength={30} pattern="[A-Za-z0-9_\-]{3,30}"
                value={codigo} onChange={event => setCodigo(event.target.value.toUpperCase())}
                placeholder="Ejemplo: MUSICA15"
              />
            </label>
            <small>Entre 3 y 30 caracteres: letras, números, guion o guion bajo. No se distinguen mayúsculas.</small>
            <label className="admin_campo">
              Descuento (%)
              <input required type="number" min="1" max="100" step="1" value={porcentaje} onChange={event => setPorcentaje(event.target.value)} />
            </label>
          </fieldset>
          <button className="admin_boton admin_boton_principal" disabled={guardando || !elegido}>
            {guardando ? "Guardando…" : "Crear código"}
          </button>
        </form>
      )}
      <p role="status">{mensaje}</p>
      <h2>Códigos creados</h2>
      <EstadoAdmin consulta={codigos} />
      {codigos.datos?.length === 0 && <p>Todavía no hay códigos de descuento.</p>}
      {codigos.datos?.length > 0 && (
        <div className="admin_tabla_contenedor">
          <table className="admin_tabla">
            <thead>
              <tr><th>Código</th><th>Evento</th><th>Descuento</th><th>Vence</th></tr>
            </thead>
            <tbody>
              {codigos.datos.map(item => (
                <tr key={item.codigo}>
                  <td><strong>{item.codigo}</strong></td>
                  <td>{nombreEvento(item.evento_id)}</td>
                  <td>{item.descuento}%</td>
                  <td>{item.fecha_expiracion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
