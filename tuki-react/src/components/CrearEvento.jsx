import { useState } from "react";
import { categorias, recintos, ciudades, subcategoriasDe, validarEvento, guardarEvento, actualizarEvento, datosDeEvento } from "../utils/eventos";
import { obtenerSectores } from "../data/sectores";

// Sin la prop evento crea uno nuevo; con ella edita el evento recibido.
function CrearEvento({ evento }) {
  const editando = Boolean(evento);
  const [datos, setDatos] = useState(() => evento ? datosDeEvento(evento) : { nombre: "", categoria: "musica", subcategoria: "", recinto: recintos[0], ciudad: ciudades[0], fecha: "", hora: "", descripcion: "" });
  const [errores, setErrores] = useState({});
  const [creado, setCreado] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const sectores = obtenerSectores({ recinto: datos.recinto, categoriaId: datos.categoria });

  function cambiar(event) {
    const { name, value } = event.target;
    setDatos({ ...datos, [name]: value, ...(name === "categoria" ? { subcategoria: "" } : {}) });
    setErrores({});
    setMensaje("");
    setCreado(null);
  }
  function guardar(event) {
    event.preventDefault();
    const errores = validarEvento(datos);
    setErrores(errores);
    if (Object.keys(errores).length) {
      event.currentTarget.elements.namedItem(Object.keys(errores)[0]).focus();
      return;
    }
    try {
      setCreado(editando ? actualizarEvento(evento.id, datos) : guardarEvento(datos));
      setMensaje("");
    } catch { setMensaje(`No se pudo ${editando ? "actualizar" : "crear"} el evento. Inténtalo nuevamente.`); }
  }
  function campo(nombre, etiqueta, tipo = "text", opciones) {
    return (
      <div className="admin_campo">
        <label htmlFor={`evento_${nombre}`}>{etiqueta}</label>
        {opciones ? (
          <select id={`evento_${nombre}`} name={nombre} value={datos[nombre]} onChange={cambiar} required aria-invalid={Boolean(errores[nombre])}>
            <option value="">Selecciona una opción</option>
            {opciones.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
          </select>
        ) : (
          <input id={`evento_${nombre}`} name={nombre} type={tipo} value={datos[nombre]} onChange={cambiar} required aria-invalid={Boolean(errores[nombre])} />
        )}
        {errores[nombre] && <p className="txt_error">{errores[nombre]}</p>}
      </div>
    );
  }
  return (
    <section>
      <h1>{editando ? "Editar evento" : "Crear evento"}</h1>
      <form className="admin_formulario" onSubmit={guardar} noValidate>
        {campo("nombre", "Nombre del evento")}
        <div className="admin_fila">
          {campo("categoria", "Categoría", "text", Object.entries(categorias))}
          {campo("subcategoria", "Subcategoría", "text", subcategoriasDe(datos.categoria).map((valor) => [valor, valor]))}
          {campo("recinto", "Recinto", "text", recintos.map((valor) => [valor, valor]))}
          {campo("ciudad", "Ciudad", "text", ciudades.map((valor) => [valor, valor]))}
          {campo("fecha", "Fecha", "date")}
          {campo("hora", "Hora", "time")}
        </div>
        <div className="admin_campo">
          <label htmlFor="evento_descripcion">Descripción</label>
          <textarea id="evento_descripcion" name="descripcion" value={datos.descripcion} onChange={cambiar} required aria-invalid={Boolean(errores.descripcion)} />
          {errores.descripcion && <p className="txt_error">{errores.descripcion}</p>}
        </div>
        <div className="admin_tarjeta">
          <h2>Sectores y precios del recinto</h2>
          <ul>{sectores.map((sector) => <li key={sector.id}>{sector.nombre}: {"$" + sector.precio.toLocaleString("es-CL")}{sector.estado === "agotada" ? " · Agotado" : ""}</li>)}</ul>
        </div>
        <button className="boton" type="submit" disabled={Boolean(creado)}>{editando ? "Guardar cambios" : "Crear evento"}</button>
        {mensaje && <p role="alert" className="txt_error">{mensaje}</p>}
        {creado && <p role="status">{editando ? "Evento actualizado." : "Evento creado."} <a href={`#/evento/${creado.id}`}>Ver evento</a> · <a href={`#/catalogo/${creado.categoria}`}>Ver en catálogo</a> · <a href="#/admin/eventos">Gestionar eventos</a></p>}
      </form>
    </section>
  );
}
export default CrearEvento;
