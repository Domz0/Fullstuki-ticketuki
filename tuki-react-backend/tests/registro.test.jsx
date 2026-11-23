import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PaginaRegistro from "../src/pages/PaginaRegistro";

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

function completarFormulario() {
  escribir("Primer nombre", "test");
  escribir("Apellido paterno", "testin");
  escribir("Nombre de usuario", "test");
  escribir("RUT", "12345678-5");
  escribir("Correo electrónico", "test@duoc.cl");
  escribir("Contraseña", "clave123");
  escribir("Confirmación de contraseña", "clave123");
}

describe("Formulario de registro", () => {
  it("envía la cuenta al backend y lleva al login", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 201 }));
    render(<PaginaRegistro />);

    completarFormulario();
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await vi.waitFor(() => expect(window.location.hash).toBe("#/login?registro=ok"));
    const [url, opciones] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/registro");
    expect(JSON.parse(opciones.body)).toEqual({
      username: "test",
      password: "clave123",
      usuario: {
        run: "12345678-5",
        p_nombre: "test",
        a_paterno: "testin",
        email: "test@duoc.cl",
      },
    });
  });

  it("muestra junto al campo el error que devuelve el backend", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({
      message: "Revisa los datos ingresados",
      errors: { "usuario.run": "El RUT ya está registrado" },
    }, { status: 409 }));
    render(<PaginaRegistro />);

    completarFormulario();
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByText("El RUT ya está registrado")).toBeInTheDocument();
    expect(screen.getByLabelText("RUT")).toHaveAttribute("aria-invalid", "true");
    expect(window.location.hash).toBe("");
  });

  it("muestra errores al enviar vacío y no llama al backend", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    render(<PaginaRegistro />);

    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(screen.getByText("Ingresa tu nombre")).toBeInTheDocument();
    expect(screen.getByText("Ingresa tu apellido")).toBeInTheDocument();
    expect(screen.getByText("Ingresa tu RUT")).toBeInTheDocument();
    expect(screen.getByText("Ingresa tu correo")).toBeInTheDocument();
    expect(screen.getByText("Ingresa una contraseña")).toBeInTheDocument();
    expect(screen.getByText("Confirma tu contraseña")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
