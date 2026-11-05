import { obtenerCatalogo } from "../utils/eventos";
import { detalleEvento } from "./detalleEvento";

export function obtenerEvento(id = "destacado") {
  if (id === "destacado") return { ...detalleEvento, id };
  const evento = obtenerCatalogo().find((item) => String(item.id) === id);
  if (!evento) return null;
  const fecha = evento.detalle.split(" · ").slice(1).join(" · ");
  const partes = fecha.split(" ");
  const categorias = {
    musica: "Música",
    artes: "Artes y Teatro",
    deportes: "Deportes",
    ferias: "Ferias & Expos",
  };
  return {
    ...detalleEvento,
    ...evento,
    id,
    categoriaId: evento.categoria,
    categoria: categorias[evento.categoria],
    ubicacion: `${evento.recinto}, ${evento.ciudad}`,
    descripcion: evento.descripcion || `${evento.nombre} en ${evento.recinto}. Información de ejemplo del catálogo.`,
    precioConCargo: Math.round(evento.precio * 1.1),
    duracion: "Por confirmar",
    edad: "Por confirmar",
    trailer: null,
    fechas: evento.fechas || [
      {
        id: "principal",
        dia: partes[1] || "—",
        mes: partes.slice(2).join(" ") || "",
        horario: fecha,
        estado: evento.estado,
      },
    ],
  };
}
