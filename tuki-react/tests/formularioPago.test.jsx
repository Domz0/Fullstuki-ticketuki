import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FormularioPago from "../src/components/FormularioPago";

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

function completarComprador() {
  escribir("Nombre", "Ana");
  escribir("Apellido", "Rojas");
  escribir("RUT", "12345678-5");
  escribir("Correo electrónico", "ana@duoc.cl");
}

// El botón de envío vive en ResumenPago, por eso se envía el formulario directamente.
function enviar(container) {
  fireEvent.submit(container.querySelector("#formulario_pago"));
}

describe("Formulario de pago", () => {
  it("muestra errores y no continúa con datos vacíos", () => {
    const onValidado = vi.fn();
    const { container } = render(<FormularioPago onValidado={onValidado} />);
    enviar(container);

    expect(screen.getByText("Ingresa tu nombre")).toBeInTheDocument();
    expect(screen.getByText("Ingresa tu apellido")).toBeInTheDocument();
    expect(
      screen.getByText("Usa el formato 12.345.678-5 o 12345678-5"),
    ).toBeInTheDocument();
    expect(screen.getByText("Revisa los campos marcados.")).toBeInTheDocument();
    expect(onValidado).not.toHaveBeenCalled();
  });

  it("continúa con los datos del comprador y el método elegido", () => {
    const onValidado = vi.fn();
    const { container } = render(<FormularioPago onValidado={onValidado} />);
    completarComprador();
    enviar(container);

    expect(onValidado).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: "Ana",
        apellido: "Rojas",
        rut: "12345678-5",
        correo: "ana@duoc.cl",
      }),
      "debito",
      1,
    );
  });
});
