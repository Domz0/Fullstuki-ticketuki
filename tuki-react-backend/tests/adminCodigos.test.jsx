import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminCodigos from "../src/components/admin/AdminCodigos";

const eventos = [
  { id_evento: 1, nombre_evento: "Festival de rock en vivo", fecha_evento: "2099-03-10", estado_evento_id_estado: 2, recinto_catalogo: "Estadio Nacional" },
  { id_evento: 2, nombre_evento: "Rock agendado", fecha_evento: "2099-05-01", estado_evento_id_estado: 1, recinto_catalogo: "Teatro Caupolicán" },
];

function mockCodigos(respuestaPost = Response.json({ codigo: "MUSICA15" }, { status: 201 })) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (url, opciones = {}) => {
    if (opciones.method === "POST") return respuestaPost;
    if (url === "/api/v1/eventos") return Response.json(eventos);
    return Response.json([]);
  });
}

function llamadaPost(fetchMock) {
  return fetchMock.mock.calls.find(([, opciones]) => opciones?.method === "POST");
}

async function completarCodigo(container) {
  fireEvent.change(await screen.findByLabelText("Buscar evento"), { target: { value: "rock" } });
  fireEvent.click(screen.getByRole("option", { name: /Festival de rock en vivo/ }));
  fireEvent.change(screen.getByLabelText("Código"), { target: { value: "musica15" } });
  fireEvent.change(screen.getByLabelText("Descuento (%)"), { target: { value: "15" } });
  fireEvent.submit(container.querySelector("form"));
}

describe("Códigos de descuento del administrador", () => {
  beforeEach(() => {
    localStorage.setItem("sesionBackend", JSON.stringify({
      token: "token-prueba",
      expiraEn: Date.now() + 60 * 60 * 1000,
      usuario: { username: "admin@duoc.cl", rol: "admin", authId: 2, usuarioId: null },
    }));
  });

  it("crea un código en mayúsculas para el evento elegido", async () => {
    const fetchMock = mockCodigos();
    const { container } = render(<AdminCodigos />);

    await completarCodigo(container);

    expect(await screen.findByText("Código creado. Ya se puede utilizar en el pago de este evento.")).toBeInTheDocument();
    const [url, opciones] = llamadaPost(fetchMock);
    expect(url).toBe("/api/v1/compras/codigos");
    expect(opciones.headers.Authorization).toBe("Bearer token-prueba");
    expect(JSON.parse(opciones.body)).toEqual({ evento: 1, codigo: "MUSICA15", porcentaje: 15 });
  });

  it("solo sugiere eventos disponibles y no crea el código sin elegir uno", async () => {
    const fetchMock = mockCodigos();
    const { container } = render(<AdminCodigos />);

    fireEvent.change(await screen.findByLabelText("Buscar evento"), { target: { value: "rock" } });
    expect(screen.getByRole("option", { name: /Festival de rock en vivo/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Rock agendado/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear código" })).toBeDisabled();

    fireEvent.submit(container.querySelector("form"));

    expect(screen.getByText("Selecciona un evento de las sugerencias.")).toBeInTheDocument();
    expect(llamadaPost(fetchMock)).toBeUndefined();
  });

  it("muestra el error del backend si el código ya existe", async () => {
    mockCodigos(Response.json({ message: "Ya existe un código con ese nombre" }, { status: 409 }));
    const { container } = render(<AdminCodigos />);

    await completarCodigo(container);

    expect(await screen.findByText("Ya existe un código con ese nombre")).toBeInTheDocument();
  });
});
