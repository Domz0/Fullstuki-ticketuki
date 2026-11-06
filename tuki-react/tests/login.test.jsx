import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PaginaLogin from "../src/pages/PaginaLogin";

describe("Formulario de login", () => {
  beforeEach(() => {
    localStorage.setItem("nombre", "pepe");
    localStorage.setItem("apellido", "nacho");
    localStorage.setItem("rut", "11111111-3");
    localStorage.setItem("correo", "chispops@duoc.cl");
    localStorage.setItem("password", "clave123");
    localStorage.setItem("sesionIniciada", "false");
  });

  it("inicia sesión al enviar las credenciales correctas", () => {
    const onIniciarSesion = vi.fn();
    render(<PaginaLogin onIniciarSesion={onIniciarSesion} />);
    const correo = screen.getByLabelText(/Correo electrónico/i);
    const password = screen.getByLabelText(/Contraseña/i);
    const boton = screen.getByRole("button", { name: /Iniciar sesión/i });

    fireEvent.change(correo, { target: { value: "chispops@duoc.cl" } });
    fireEvent.change(password, { target: { value: "clave123" } });
    fireEvent.click(boton);

    expect(onIniciarSesion).toHaveBeenCalledWith(
      expect.objectContaining({ correo: "chispops@duoc.cl", rol: "cliente" }),
    );
    expect(localStorage.getItem("sesionIniciada")).toBe("true");
    expect(window.location.hash).toBe("#/inicio");
  });

  it("muestra un error y no inicia sesión con una contraseña incorrecta", () => {
    const onIniciarSesion = vi.fn();
    render(<PaginaLogin onIniciarSesion={onIniciarSesion} />);
    const correo = screen.getByLabelText(/Correo electrónico/i);
    const password = screen.getByLabelText(/Contraseña/i);
    const boton = screen.getByRole("button", { name: /Iniciar sesión/i });

    fireEvent.change(correo, { target: { value: "chispops@duoc.cl" } });
    fireEvent.change(password, { target: { value: "incorrecta" } });
    fireEvent.click(boton);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Correo o contraseña incorrectos.",
    );
    expect(password).toHaveAttribute("aria-invalid", "true");
    expect(onIniciarSesion).not.toHaveBeenCalled();
    expect(localStorage.getItem("sesionIniciada")).toBe("false");
    expect(window.location.hash).toBe("");
  });
});
