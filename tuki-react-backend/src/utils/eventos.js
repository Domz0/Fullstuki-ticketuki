import { catalogo } from "../data/catalogo";
import { obtenerSectores } from "../data/sectores";

export const categorias = { musica: "Música", artes: "Artes y Teatro", deportes: "Deportes", ferias: "Ferias & Expos" };
export const recintos = [...new Set(catalogo.map((evento) => evento.recinto))];
export const ciudades = [...new Set(catalogo.map((evento) => evento.ciudad))];
export function subcategoriasDe(categoria) {
  return [...new Set(catalogo.filter((evento) => evento.categoria === categoria).map((evento) => evento.subcategoria))];
}
export function leerEventosCreados() {
  const eventos = JSON.parse(localStorage.getItem("eventosCreados") || "[]");
  return Array.isArray(eventos) ? eventos : [];
}
export function obtenerCatalogo() {
  return [...catalogo, ...leerEventosCreados()];
}
export function validarEvento(datos) {
  const errores = {};
  if (!datos.nombre.trim()) errores.nombre = "Ingresa el nombre.";
  if (!categorias[datos.categoria]) errores.categoria = "Elige una categoría.";
  if (!subcategoriasDe(datos.categoria).includes(datos.subcategoria)) errores.subcategoria = "Elige una subcategoría.";
  if (!recintos.includes(datos.recinto)) errores.recinto = "Elige un recinto.";
  if (!ciudades.includes(datos.ciudad)) errores.ciudad = "Elige una ciudad.";
  const fecha = new Date(`${datos.fecha}T${datos.hora}`);
  if (!datos.fecha || !datos.hora || Number.isNaN(fecha.getTime()) || fecha <= new Date()) {
    errores.fecha = "Elige una fecha y hora futuras.";
  }
  if (!datos.descripcion.trim()) errores.descripcion = "Ingresa una descripción.";
  return errores;
}
function escribirEventos(eventos) {
  localStorage.setItem("eventosCreados", JSON.stringify(eventos));
}
function comprobarDatos(datos) {
  if (Object.keys(validarEvento(datos)).length) throw new Error("Datos inválidos");
}
function construirEvento(datos, id) {
  const fecha = new Date(`${datos.fecha}T${datos.hora}`);
  const sectores = obtenerSectores({ recinto: datos.recinto, categoriaId: datos.categoria });
  const precio = Math.min(...sectores.filter((sector) => sector.estado !== "agotada").map((sector) => sector.precio));
  return {
    id,
    nombre: datos.nombre.trim(),
    categoria: datos.categoria,
    subcategoria: datos.subcategoria,
    recinto: datos.recinto,
    ciudad: datos.ciudad,
    descripcion: datos.descripcion.trim(),
    fechaInicio: fecha.toISOString(),
    precio,
    plazo: 3,
    estado: "Disponible",
    detalle: `${datos.recinto} · ${fecha.toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}, ${datos.hora}`,
    fechas: [{
      id: "principal",
      dia: String(fecha.getDate()),
      mes: fecha.toLocaleDateString("es-CL", { month: "short", year: "numeric" }),
      horario: datos.hora,
      estado: "Disponible",
    }],
  };
}
export function guardarEvento(datos) {
  comprobarDatos(datos);
  const evento = construirEvento(datos, crypto.randomUUID());
  escribirEventos([...leerEventosCreados(), evento]);
  return evento;
}
// Solo se editan y eliminan los eventos creados desde el panel; el catálogo base es fijo.
export function actualizarEvento(id, datos) {
  comprobarDatos(datos);
  const eventos = leerEventosCreados();
  if (!eventos.some((evento) => evento.id === id)) throw new Error("Evento no encontrado");
  const actualizado = construirEvento(datos, id);
  escribirEventos(eventos.map((evento) => (evento.id === id ? actualizado : evento)));
  return actualizado;
}
export function eliminarEvento(id) {
  const eventos = leerEventosCreados();
  const restantes = eventos.filter((evento) => evento.id !== id);
  if (restantes.length === eventos.length) return false;
  escribirEventos(restantes);
  return true;
}
export function datosDeEvento(evento) {
  const fecha = new Date(evento.fechaInicio);
  const dosDigitos = (numero) => String(numero).padStart(2, "0");
  return {
    nombre: evento.nombre,
    categoria: evento.categoria,
    subcategoria: evento.subcategoria,
    recinto: evento.recinto,
    ciudad: evento.ciudad,
    fecha: `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`,
    hora: `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`,
    descripcion: evento.descripcion,
  };
}
