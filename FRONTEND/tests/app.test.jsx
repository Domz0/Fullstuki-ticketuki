import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";

const usuarioCliente = {
  username: "ana", nombre: "Ana", apellido: "Rojas", correo: "ana@duoc.cl",
  rut: "12345678-5", rol: "cliente", authId: 3, usuarioId: 4,
};

function guardarSesion(usuario = {}) {
  const sesion = { token: "token-prueba", expiraEn: Date.now() + 60 * 60 * 1000, usuario: { ...usuarioCliente, ...usuario } };
  localStorage.setItem("sesionBackend", JSON.stringify(sesion));
  return sesion;
}


function mockEventosVacios() {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async () => Response.json([]));
}

function abrir(ruta) {
  window.location.hash = ruta;
  render(<App />);
}

describe("Navegación y protección de vistas", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    mockEventosVacios();
  });

  it("redirige al login si se abre la cuenta sin sesion", async () => {
    abrir("/cuenta/datos");

    await waitFor(() => expect(window.location.hash).toBe("#/login"));
    expect(await screen.findByRole("button", { name: /Iniciar sesión/i })).toBeInTheDocument();
  });

  it("no deja entrar a un cliente al panel de administracion", async () => {
    guardarSesion({ rol: "cliente" });
    abrir("/admin/dashboard");

    await waitFor(() => expect(window.location.hash).toBe("#/inicio"));
    expect(screen.queryByRole("heading", { name: "Dashboard" })).not.toBeInTheDocument();
  });
});

describe("Fin de la sesión", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("cierra la sesion cuando el backend responde 401", async () => {
    let responder401;
    vi.spyOn(globalThis, "fetch").mockImplementation(url => {
      if (url !== "/api/v1/usuarios/4") return Promise.resolve(Response.json([]));
      return new Promise(resolver => {
        responder401 = () => resolver(Response.json({ message: "Sesión inválida o vencida" }, { status: 401 }));
      });
    });
    guardarSesion();
    abrir("/cuenta/datos");
    await waitFor(() => expect(document.querySelector("main.pantalla_cuenta")).not.toBeNull());
    await waitFor(() => expect(responder401).toBeDefined());

    responder401();

    await waitFor(() => expect(window.location.hash).toBe("#/login?sesion=vencida"));
    expect(localStorage.getItem("sesionBackend")).toBeNull();
    expect(await screen.findByText("Tu sesión venció. Inicia sesión nuevamente.")).toBeInTheDocument();
  });
});
