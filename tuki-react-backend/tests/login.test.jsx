import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PaginaLogin from "../src/pages/PaginaLogin";

function ingresar(usuario, contrasena) {
  fireEvent.change(screen.getByLabelText("Nombre de usuario o correo"), { target: { value: usuario } });
  fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: contrasena } });
  fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
}

const loginCliente = {
  token: "jwt-cliente",
  tipo: "Bearer",
  username: "pepe",
  expiraEnMs: 3600000,
  authId: 3,
  usuarioId: 4,
  rol: "CLIENTE",
};

describe("Formulario de login", () => {
  it("inicia sesion con el token del backend y lo guarda", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json(loginCliente));
    const onIniciarSesion = vi.fn();
    render(<PaginaLogin onIniciarSesion={onIniciarSesion} />);


    ingresar(" Ana ", "clave123");

    await vi.waitFor(() => expect(onIniciarSesion).toHaveBeenCalled());
    const [url, opciones] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/auth/login");
    expect(JSON.parse(opciones.body)).toEqual({ username: "ana", password: "clave123" });
    expect(onIniciarSesion).toHaveBeenCalledWith(expect.objectContaining({ username: "pepe", rol: "cliente" }));
    expect(JSON.parse(localStorage.getItem("sesionBackend")).token).toBe("jwt-cliente");
    expect(window.location.hash).toBe("#/inicio");
  });

  it("muestra el error del backend y no guarda sesión con una contraseña incorrecta", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ message: "Usuario o contraseña incorrectos" }, { status: 401 }),
    );
    const onIniciarSesion = vi.fn();
    render(<PaginaLogin onIniciarSesion={onIniciarSesion} />);

    ingresar("chispops@duoc.cl", "incorrecta");

    expect(await screen.findByRole("status")).toHaveTextContent("Usuario o contraseña incorrectos");
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("aria-invalid", "true");
    expect(onIniciarSesion).not.toHaveBeenCalled();
    expect(localStorage.getItem("sesionBackend")).toBeNull();
  });

  it("valida los campos antes de llamar al backend", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    render(<PaginaLogin onIniciarSesion={vi.fn()} />);

    ingresar("", "");

    expect(screen.getByText("Ingresa tu nombre de usuario o correo")).toBeInTheDocument();
    expect(screen.getByText("Ingresa tu contraseña")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
