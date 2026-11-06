import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PaginaRegistro from "../src/pages/PaginaRegistro";

describe("Formulario de registro", () => {
  it("guarda una cuenta válida y lleva al login", () => {
    render(<PaginaRegistro />);
    fireEvent.change(screen.getByLabelText(/^Nombre$/i), {
      target: { value: "test" },
    });
    fireEvent.change(screen.getByLabelText(/^Apellido$/i), {
      target: { value: "testin" },
    });
    fireEvent.change(screen.getByLabelText(/^RUT$/i), {
      target: { value: "12345678-5" },
    });
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: "test@duoc.cl" },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: "clave123" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(localStorage.getItem("nombre")).toBe("test");
    expect(localStorage.getItem("correo")).toBe("test@duoc.cl");
    expect(localStorage.getItem("password")).toBe("clave123");
    expect(localStorage.getItem("sesionIniciada")).toBe("false");
    expect(window.location.hash).toBe("#/login?registro=ok");
  });

  it("muestra errores al enviar vacío y no guarda una cuenta", () => {
    render(<PaginaRegistro />);
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(screen.getByText("Ingresa tu nombre")).toBeInTheDocument();
    expect(screen.getByText("Ingresa tu apellido")).toBeInTheDocument();
    expect(screen.getByText("Ingresa tu RUT")).toBeInTheDocument();
    expect(screen.getByText("Ingresa tu correo")).toBeInTheDocument();
    expect(screen.getByText("Ingresa una contraseña")).toBeInTheDocument();
    expect(screen.getByText("Debes aceptar los términos")).toBeInTheDocument();
    expect(localStorage.getItem("correo")).toBeNull();
    expect(window.location.hash).toBe("");
  });
});
