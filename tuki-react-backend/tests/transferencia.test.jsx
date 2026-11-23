import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PaginaTransferir from "../src/pages/PaginaTransferir";

const perfil = { id_usuario: 4, run: "12345678-5", p_nombre: "Ana", a_paterno: "Rojas", email: "ana@duoc.cl" };
const ticket = {
  id_ticket: 21,
  evento_id_evento: 7,
  sector_id_sector: 2,
  estado_ticket_id_estado: 1,
  cod_qr: "TKI-ABC",
  venta_id_venta: 55,
  nombre_titular: "Ana Rojas",
};
const destinatario = { id: 9, nombre: "Camila Soto", correo: "camila@gmail.com" };

const evento = { id_evento: 7, nombre_evento: "Festival de rock en vivo", fecha_evento: "2099-11-14", horario: "20:00", estado_evento_id_estado: 2 };


function mockTransferencia({ entradas = [ticket], buscarDestinatario = Response.json(destinatario) } = {}) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (url, opciones = {}) => {
    if (opciones.method === "PUT") return Response.json({ ...ticket, nombre_titular: "Camila Soto" });
    if (url.startsWith("/api/usuarios/destinatario")) return buscarDestinatario;
    if (url === "/api/usuarios/4") return Response.json(perfil);
    if (url.startsWith("/api/tickets/titular/")) return Response.json(entradas);
    if (url === "/api/eventos/7/sectores") return Response.json([{ id_sector: 2, nombre_sector: "Cancha General" }]);
    return Response.json(evento);
  });
}

async function elegirEntradaYBuscar(correo) {
  fireEvent.click(await screen.findByRole("radio", { name: /Festival de rock en vivo/ }));
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
  fireEvent.change(screen.getByLabelText("Correo del destinatario"), { target: { value: correo } });
  fireEvent.click(screen.getByRole("button", { name: "Buscar destinatario" }));
}

describe("Transferencia de entradas", () => {
  beforeEach(() => {
    localStorage.setItem("sesionBackend", JSON.stringify({
      token: "token-prueba",
      expiraEn: Date.now() + 60 * 60 * 1000,
      usuario: { username: "ana", nombre: "Ana", apellido: "Rojas", correo: "ana@duoc.cl", rol: "cliente", authId: 3, usuarioId: 4 },
    }));
  });

  it("transfiere una entrada vigente al destinatario encontrado", async () => {
    const fetchMock = mockTransferencia();
    render(<PaginaTransferir usuario={{ usuarioId: 4 }} />);

    await elegirEntradaYBuscar("camila@gmail.com");
    fireEvent.click(await screen.findByRole("button", { name: "Elegir destinatario" }));
    expect(screen.getByText("Entrada TKI-ABC")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar transferencia" }));

    expect(await screen.findByRole("heading", { name: "Entrada transferida" }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText(/ahora pertenece a Camila Soto/)).toBeInTheDocument();
    const [url, opciones] = fetchMock.mock.calls.find(([, op]) => op?.method === "PUT");
    expect(url).toBe("/api/tickets/21/regalar");
    expect(JSON.parse(opciones.body)).toEqual({ destinatario: 9, correo: "camila@gmail.com" });
  });

  it("valida el correo antes de buscar al destinatario", async () => {
    const fetchMock = mockTransferencia();
    render(<PaginaTransferir usuario={{ usuarioId: 4 }} />);

    await elegirEntradaYBuscar("camila@otro.com");

    expect(screen.getByRole("alert")).toHaveTextContent("Ingresa un correo de duoc.cl");
    expect(fetchMock.mock.calls.some(([url]) => url.includes("/usuarios/destinatario"))).toBe(false);
  });

  it("no permite transferirse la entrada a uno mismo", async () => {
    mockTransferencia({ buscarDestinatario: Response.json({ id: 4, nombre: "Ana Rojas", correo: "ana@duoc.cl" }) });
    render(<PaginaTransferir usuario={{ usuarioId: 4 }} />);

    await elegirEntradaYBuscar("ana@duoc.cl");

    expect(await screen.findByRole("alert")).toHaveTextContent("No puedes transferirte una entrada a ti mismo.");
    expect(screen.queryByRole("button", { name: "Elegir destinatario" })).not.toBeInTheDocument();
  });
});
