import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CrearEvento from "../src/components/admin/CrearEvento";
import EditarEvento from "../src/components/admin/EditarEvento";

const recintos = [{ id_recinto: 1, nombre_recinto: "Estadio Nacional" }];
const sectoresRecinto = [
  { id_sector: 10, nombre_sector: "Cancha", capacidad_sector: 500, precio_sector: 20000 },
  { id_sector: 11, nombre_sector: "Galería", capacidad_sector: 300, precio_sector: 10000 },
];

function mockCrear() {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (url, opciones = {}) => {
    if (opciones.method === "POST") return Response.json({ id_evento: 99 }, { status: 201 });
    if (url === "/api/v1/recintos") return Response.json(recintos);
    return Response.json(sectoresRecinto);
  });
}

function cuerpoPost(fetchMock, metodo) {
  const llamada = fetchMock.mock.calls.find(([, opciones]) => opciones?.method === metodo);
  return llamada && JSON.parse(llamada[1].body);
}

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

async function completarEvento() {

  await screen.findByLabelText("Nombre del evento");
  escribir("Nombre del evento", "Concierto de tukis");
  escribir("Subcategoría", "Rock");
  escribir("Recinto", "1");
  escribir("Ciudad", "Santiago");
  escribir("Fecha", "2099-11-20");
  escribir("Hora", "20:00");
  escribir("Descripción", "concierto de tukis.");
  await screen.findByLabelText("Cupos Cancha");
}

describe("Crear evento desde el admin", () => {
  beforeEach(() => {
    localStorage.setItem("sesionBackend", JSON.stringify({
      token: "token-prueba",
      expiraEn: Date.now() + 60 * 60 * 1000,
      usuario: { username: "admin@duoc.cl", rol: "admin", authId: 2, usuarioId: null },
    }));
  });

  it("carga los sectores del recinto y crea el evento con sus cupos", async () => {
    const fetchMock = mockCrear();
    render(<CrearEvento />);

    await completarEvento();
    escribir("Cupos Galería", "0");
    fireEvent.click(screen.getByRole("button", { name: "Crear evento" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Evento guardado.");
    expect(screen.getByRole("link", { name: "Ver evento" })).toHaveAttribute("href", "#/evento/99");
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/eventos", expect.objectContaining({ method: "POST" }));
    expect(cuerpoPost(fetchMock, "POST")).toMatchObject({
      nombre_evento: "Concierto de tukis",
      categoria: "musica",
      recinto_id_recinto: 1,
      recinto_catalogo: "Estadio Nacional",
      fecha_evento: "2099-11-20",
      horario: "20:00",
      sectores: [
        { sector_id: 10, capacidad: 500, precio: 20000 },
        { sector_id: 11, capacidad: 0, precio: 10000 },
      ],
    });
  });

  it("no crea un evento sin cupos", async () => {
    const fetchMock = mockCrear();
    render(<CrearEvento />);

    await completarEvento();
    escribir("Cupos Cancha", "0");
    escribir("Cupos Galería", "0");
    fireEvent.click(screen.getByRole("button", { name: "Crear evento" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Debes habilitar al menos un cupo.");
    expect(cuerpoPost(fetchMock, "POST")).toBeUndefined();
  });
});

describe("Editar evento desde el admin", () => {
  beforeEach(() => {
    localStorage.setItem("sesionBackend", JSON.stringify({
      token: "token-prueba",
      expiraEn: Date.now() + 60 * 60 * 1000,
      usuario: { username: "admin@duoc.cl", rol: "admin", authId: 2, usuarioId: null },
    }));
  });

  it("actualiza los datos sin reenviar cupos ni precios", async () => {
    const evento = {
      id_evento: 7,
      nombre_evento: "Concierto de prueba",
      categoria: "musica",
      subcategoria: "Rock",
      ciudad: "Santiago",
      recinto_id_recinto: 1,
      fecha_evento: "2099-11-20",
      horario: "20:00",
      descripcion: "Descripción de prueba",
      estado_evento_id_estado: 2,
    };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (url, opciones = {}) => {
      if (opciones.method === "PUT") return Response.json({ ...evento, nombre_evento: "Nombre nuevo" });
      if (url === "/api/v1/eventos/7") return Response.json(evento);
      if (url === "/api/v1/recintos") return Response.json(recintos);
      return Response.json(sectoresRecinto);
    });
    render(<EditarEvento id="7" />);

    expect(await screen.findByLabelText("Nombre del evento")).toHaveValue("Concierto de prueba");
    expect(screen.getByLabelText("Recinto")).toBeDisabled();
    await screen.findByText("Cancha");
    escribir("Nombre del evento", "Nombre nuevo");
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Evento guardado.");
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/eventos/7", expect.objectContaining({ method: "PUT" }));
    const enviado = cuerpoPost(fetchMock, "PUT");
    expect(enviado).toMatchObject({ nombre_evento: "Nombre nuevo", recinto_id_recinto: 1 });
    expect(enviado.sectores).toBeUndefined();
  });
});
