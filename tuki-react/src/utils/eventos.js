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
export function guardarEvento(datos) {
  if (Object.keys(validarEvento(datos)).length) throw new Error("Datos inválidos");
  const fecha = new Date(`${datos.fecha}T${datos.hora}`);
  const sectores = obtenerSectores({ recinto: datos.recinto, categoriaId: datos.categoria });
  const precio = Math.min(...sectores.filter((sector) => sector.estado !== "agotada").map((sector) => sector.precio));
  const evento = {
    id: crypto.randomUUID(),
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
  localStorage.setItem("eventosCreados", JSON.stringify([...leerEventosCreados(), evento]));
  return evento;
}
