import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";

function sesionCliente() {
  localStorage.setItem("nombre", "Ana");
  localStorage.setItem("apellido", "Rojas");
  localStorage.setItem("rut", "12345678-5");
  localStorage.setItem("correo", "ana@duoc.cl");
  localStorage.setItem("rol", "cliente");
  localStorage.setItem("sesionIniciada", "true");
}

function abrir(ruta) {
  window.location.hash = ruta;
  render(<App />);
}

describe("Navegación y protección de vistas", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("redirige al login si se abre la cuenta sin sesión", async () => {
    abrir("/cuenta/datos");

    await waitFor(() => expect(window.location.hash).toBe("#/login"));
    expect(
      await screen.findByRole("button", { name: /Iniciar sesión/i }),
    ).toBeInTheDocument();
  });

  it("no deja entrar a un cliente al panel de administración", async () => {
    sesionCliente();
    abrir("/admin/dashboard");

    await waitFor(() => expect(window.location.hash).toBe("#/inicio"));
    expect(screen.queryByRole("heading", { name: "Dashboard" })).not.toBeInTheDocument();
  });
});
