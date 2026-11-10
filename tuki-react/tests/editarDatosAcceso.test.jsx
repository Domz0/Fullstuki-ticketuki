import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EditarDatosAcceso from "../src/components/EditarDatosAcceso";

const usuario = { correo: "ana@duoc.cl" };

describe("Formulario de editar datos de acceso", () => {
  beforeEach(() => {
    localStorage.setItem("sesionIniciada", "true");
    localStorage.setItem("rol", "cliente");
    localStorage.setItem("correo", "ana@duoc.cl");
    localStorage.setItem("password", "clave123");
  });

  it("muestra errores y no guarda datos inválidos", () => {
    const onActualizarUsuario = vi.fn();
    render(
      <EditarDatosAcceso
        usuario={usuario}
        onActualizarUsuario={onActualizarUsuario}
      />,
    );
    fireEvent.change(screen.getByLabelText("Nuevo correo"), {
      target: { value: "correo-invalido" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(screen.getByText("Correo no válido")).toBeInTheDocument();
    expect(screen.getByText("Ingresa tu contraseña")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Revisa los campos marcados.",
    );
    expect(localStorage.getItem("correo")).toBe("ana@duoc.cl");
    expect(onActualizarUsuario).not.toHaveBeenCalled();
  });

  it("guarda los datos válidos y avisa al componente padre", () => {
    const onActualizarUsuario = vi.fn();
    render(
      <EditarDatosAcceso
        usuario={usuario}
        onActualizarUsuario={onActualizarUsuario}
      />,
    );
    fireEvent.change(screen.getByLabelText("Nuevo correo"), {
      target: { value: "nueva@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText("Nueva contraseña"), {
      target: { value: "otra123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(localStorage.getItem("correo")).toBe("nueva@gmail.com");
    expect(localStorage.getItem("password")).toBe("otra123");
    expect(onActualizarUsuario).toHaveBeenCalledWith(
      expect.objectContaining({ correo: "nueva@gmail.com" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Datos de acceso guardados.",
    );
  });
});
