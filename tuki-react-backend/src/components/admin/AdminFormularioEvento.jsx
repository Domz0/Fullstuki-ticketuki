import { useEffect, useRef, useState } from "react";
import { apiAdmin, estadosEvento, hoyChile, pesos } from "../../services/admin";
import { useAdminDatos } from "../../hooks/useAdminDatos";
import { categorias } from "../../utils/eventos";
import { EstadoAdmin } from "./AdminVentas";

export function EditarEventoReal({ id }) {
  const consulta = useAdminDatos(`/eventos/${id}`);
  if (!consulta.datos) return <EstadoAdmin consulta={consulta} />;
  return <AdminFormularioEvento key={id} evento={consulta.datos} />;
}

export default function AdminFormularioEvento({ evento }) {
  const recintos = useAdminDatos("/recintos");
  const [datos, setDatos] = useState({
    nombre_evento: evento?.nombre_evento || "",
    categoria: evento?.categoria || "musica",
    subcategoria: evento?.subcategoria || "",
    ciudad: evento?.ciudad || "",
    recinto_id_recinto: evento?.recinto_id_recinto || "",
    fecha_evento: evento?.fecha_evento || "",
    horario: evento?.horario || "",
    descripcion: evento?.descripcion || "",
    participantes: evento?.participantes || "",
    estado_evento_id_estado: evento?.estado_evento_id_estado || 1,
  });
  const [sectores, setSectores] = useState([]);
  const [cargandoSectores, setCargandoSectores] = useState(Boolean(evento));
  const [errorSectores, setErrorSectores] = useState("");
  const [intento, setIntento] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(null);
  const bloqueo = useRef(false);

  const editando = Boolean(evento);
  const capacidadTotal = sectores.reduce((total, sector) => total + Number(sector.capacidad), 0);
  const sectoresListos = !cargandoSectores && !errorSectores;
  const formularioBloqueado = guardando || Boolean(guardado && !editando);
  let textoGuardar = editando ? "Guardar cambios" : "Crear evento";
  if (guardando) textoGuardar = "Guardando…";

  // al editar se consultan los sectores del evento y al crear los del recinto
  useEffect(() => {
    if (!datos.recinto_id_recinto) return;
    const controlador = new AbortController();

    async function cargarSectores() {
      let ruta = `/sectores/recinto/${datos.recinto_id_recinto}`;
      if (evento) ruta = `/eventos/${evento.id_evento}/sectores`;

      try {
        const lista = await apiAdmin(ruta, { signal: controlador.signal });
        if (controlador.signal.aborted) return;

        const sectoresFormulario = lista.map(sector => ({
          ...sector,
          capacidad: sector.capacidad_sector,
          precio: sector.precio_sector,
        }));
        setSectores(sectoresFormulario);
      } catch (fallo) {
        if (!controlador.signal.aborted) setErrorSectores(fallo.message);
      } finally {
        if (!controlador.signal.aborted) setCargandoSectores(false);
      }
    }

    cargarSectores();
    return () => controlador.abort();
  }, [datos.recinto_id_recinto, evento, intento]);

  function cambiar(event) {
    const { name, value } = event.target;
    setDatos(actuales => ({ ...actuales, [name]: value }));
    setError("");
    setGuardado(null);

    if (name === "recinto_id_recinto") {
      setSectores([]);
      setErrorSectores("");
      setCargandoSectores(Boolean(value));
    }
  }

  function cambiarSector(id, campo, valor) {
    setSectores(lista => lista.map(sector => {
      if (sector.id_sector !== id) return sector;
      return { ...sector, [campo]: valor };
    }));
    setGuardado(null);
  }

  function reintentarSectores() {
    setErrorSectores("");
    setCargandoSectores(true);
    setIntento(anterior => anterior + 1);
  }

  async function guardar(event) {
    event.preventDefault();
    if (bloqueo.current) return;

    const recinto = recintos.datos?.find(item => item.id_recinto === Number(datos.recinto_id_recinto));
    if (!recinto || !sectoresListos) {
      setError("Carga el recinto y sus sectores antes de guardar.");
      return;
    }
    if (!editando && capacidadTotal <= 0) {
      setError("Debes habilitar al menos un cupo.");
      return;
    }

    const datosEvento = {
      ...datos,
      recinto_id_recinto: Number(datos.recinto_id_recinto),
      recinto_catalogo: recinto.nombre_recinto,
      estado_evento_id_estado: Number(datos.estado_evento_id_estado),
    };
    // los cupos y precios solo se envian al crear el evento
    if (!editando) {
      datosEvento.sectores = sectores.map(sector => ({
        sector_id: sector.id_sector,
        capacidad: Number(sector.capacidad),
        precio: Number(sector.precio),
      }));
    }

    bloqueo.current = true;
    setGuardando(true);
    setError("");
    setGuardado(null);
    try {
      const ruta = editando ? `/eventos/${evento.id_evento}` : "/eventos";
      const resultado = await apiAdmin(ruta, {
        method: editando ? "PUT" : "POST",
        body: datosEvento,
      });
      setGuardado(resultado);
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setGuardando(false);
      bloqueo.current = false;
    }
  }

  // todos los campos usan el mismo estado del formulario
  function campo(nombre, etiqueta, tipo = "text", opciones, extra = {}) {
    let control = (
      <input name={nombre} type={tipo} value={datos[nombre]} onChange={cambiar} required {...extra} />
    );
    if (opciones) {
      control = (
        <select name={nombre} value={datos[nombre]} onChange={cambiar} required {...extra}>
          <option value="">Selecciona una opción</option>
          {opciones.map(([id, texto]) => <option key={id} value={id}>{texto}</option>)}
        </select>
      );
    }
    return <label className="admin_campo">{etiqueta}{control}</label>;
  }

  return (
    <section>
      <h1>{editando ? "Editar evento" : "Crear evento"}</h1>
      <EstadoAdmin consulta={recintos} />
      {recintos.datos && (
        <form className="admin_formulario" onSubmit={guardar}>
          <fieldset disabled={formularioBloqueado} className="admin_campos">
            {campo("nombre_evento", "Nombre del evento", "text", null, { maxLength: 100 })}
            <div className="admin_fila">
              {campo("categoria", "Categoría", "text", Object.entries(categorias))}
              {campo("subcategoria", "Subcategoría", "text", null, { maxLength: 50 })}
              {campo("recinto_id_recinto", "Recinto", "text",
                recintos.datos.map(recinto => [recinto.id_recinto, recinto.nombre_recinto]),
                { disabled: editando })}
              {campo("ciudad", "Ciudad", "text", null, { maxLength: 50 })}
              {campo("fecha_evento", "Fecha", "date", null, { min: editando ? undefined : hoyChile() })}
              {campo("horario", "Hora", "time")}
              {campo("estado_evento_id_estado", "Estado", "text", Object.entries(estadosEvento))}
              {campo("participantes", "Participantes (opcional)", "text", null, { required: false, maxLength: 500 })}
            </div>
            <label className="admin_campo">
              Descripción
              <textarea name="descripcion" maxLength={500} value={datos.descripcion} onChange={cambiar} required />
            </label>
            <div className="admin_tarjeta">
              <h2>Sectores, cupos y precios</h2>
              {editando && <p>El recinto, los cupos y los precios se conservan para respetar las ventas y reservas existentes.</p>}
              {cargandoSectores && <p role="status">Cargando sectores…</p>}
              {!cargandoSectores && errorSectores && (
                <>
                  <p role="alert">{errorSectores}</p>
                  <button type="button" onClick={reintentarSectores}>Reintentar</button>
                </>
              )}
              {sectoresListos && sectores.length === 0 && <p>Selecciona un recinto con sectores configurados.</p>}
              {sectoresListos && sectores.length > 0 && (
                <>
                  <div className="admin_tabla_contenedor">
                    <table className="admin_tabla">
                      <thead><tr><th>Sector</th><th>Cupos</th><th>Precio por entrada</th></tr></thead>
                      <tbody>
                        {sectores.map(sector => (
                          <tr key={sector.id_sector}>
                            <td data-label="Sector">{sector.nombre_sector}</td>
                            <td data-label="Cupos">
                              {editando ? sector.capacidad : (
                                <input
                                  aria-label={`Cupos ${sector.nombre_sector}`}
                                  type="number" required min="0" max={sector.capacidad_sector} step="1"
                                  value={sector.capacidad}
                                  onChange={event => cambiarSector(sector.id_sector, "capacidad", event.target.value)}
                                />
                              )}
                            </td>
                            <td data-label="Precio por entrada">
                              {editando ? pesos(sector.precio) : (
                                <input
                                  aria-label={`Precio ${sector.nombre_sector}`}
                                  type="number" required min="0" max="2147483647" step="1"
                                  value={sector.precio}
                                  onChange={event => cambiarSector(sector.id_sector, "precio", event.target.value)}
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p>Capacidad total: {capacidadTotal} cupos. Los precios son netos; se agregan IVA y cargo por servicio al comprar.</p>
                </>
              )}
            </div>
            <button className="admin_guardar" disabled={!sectoresListos || sectores.length === 0}>{textoGuardar}</button>
          </fieldset>
          {error && <p role="alert">{error}</p>}
          {guardado && (
            <p role="status">Evento guardado. <a href={`#/evento/${guardado.id_evento}`}>Ver evento</a></p>
          )}
          <a className="admin_boton admin_volver" href="#/admin/eventos">
            <span aria-hidden="true">←</span> Volver a gestionar eventos
          </a>
        </form>
      )}
    </section>
  );
}
