import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EditarDatosAcceso from "../src/components/cuenta/EditarDatosAcceso";

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

function guardar() {
  fireEvent.click(screen.getByRole("button", { name: "Guardar contraseña" }));
}

describe("Cambio de contraseña", () => {
  beforeEach(() => {
    localStorage.setItem("sesionBackend", JSON.stringify({
      token: "token-prueba",
      expiraEn: Date.now() + 60 * 60 * 1000,
      usuario: { username: "ana", nombre: "Ana", apellido: "Rojas", rol: "cliente", authId: 3, usuarioId: 4 },
    }));
  });

  it("valida los campos y no llama al backend", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    render(<EditarDatosAcceso onActualizarUsuario={vi.fn()} />);

    escribir("Nueva contraseña", "otra123");
    escribir("Confirmar nueva contraseña", "distinta");
    guardar();

    expect(screen.getByText("Ingresa tu contraseña actual")).toBeInTheDocument();
    expect(screen.getByText("Usa entre 8 y 100 caracteres")).toBeInTheDocument();
    expect(screen.getByText("Las contraseñas no coinciden")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("no acepta una contraseña nueva igual a la actual", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    render(<EditarDatosAcceso onActualizarUsuario={vi.fn()} />);

    escribir("Contraseña actual", "clave123");
    escribir("Nueva contraseña", "clave123");
    escribir("Confirmar nueva contraseña", "clave123");
    guardar();

    expect(screen.getByText("La nueva contraseña debe ser distinta")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("cambia la contraseña, cierra la sesion y vuelve al login", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ authId: 3, username: "ana" }));
    const onActualizarUsuario = vi.fn();
    render(<EditarDatosAcceso onActualizarUsuario={onActualizarUsuario} />);

    escribir("Contraseña actual", "clave123");
    escribir("Nueva contraseña", "otra1234");
    escribir("Confirmar nueva contraseña", "otra1234");
    guardar();

    await vi.waitFor(() => expect(window.location.hash).toBe("#/login?contrasena=ok"));
    const [url, opciones] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/contrasena");
    expect(opciones.method).toBe("PATCH");
    expect(opciones.headers.Authorization).toBe("Bearer token-prueba");
    expect(JSON.parse(opciones.body)).toEqual({ actual: "clave123", nueva: "otra1234" });
    expect(onActualizarUsuario).toHaveBeenCalledWith(null);
    expect(localStorage.getItem("sesionBackend")).toBeNull();
  });
});
