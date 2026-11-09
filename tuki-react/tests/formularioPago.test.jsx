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

  it("rechaza una tarjeta de crédito vencida", () => {
    const onValidado = vi.fn();
    const { container } = render(<FormularioPago onValidado={onValidado} />);
    completarComprador();
    fireEvent.click(screen.getByRole("radio", { name: /Crédito/ }));
    escribir("Dígitos de tarjeta", "4111 1111 1111 1111");
    escribir("Fecha de vencimiento", "01/20");
    escribir("CVV", "123");
    enviar(container);

    expect(screen.getByText("La tarjeta está vencida")).toBeInTheDocument();
    expect(onValidado).not.toHaveBeenCalled();
  });

  it("autocompleta los datos del usuario con sesión iniciada", () => {
    render(
      <FormularioPago
        onValidado={vi.fn()}
        usuario={{
          nombre: "Ana",
          apellido: "Rojas",
          rut: "12345678-5",
          correo: "ana@duoc.cl",
        }}
      />,
    );

    expect(screen.getByLabelText("Nombre")).toHaveValue("Ana");
    expect(screen.getByLabelText("Correo electrónico")).toHaveValue("ana@duoc.cl");
  });

  it("solo aplica un código de descuento válido", () => {
    const onAplicarCodigo = vi.fn();
    render(
      <FormularioPago onValidado={vi.fn()} onAplicarCodigo={onAplicarCodigo} />,
    );
    const aplicar = screen.getByRole("button", { name: "Aplicar" });

    escribir("Ingresa tu código (opcional)", "OTRO");
    fireEvent.click(aplicar);
    expect(screen.getByText("Código no válido")).toBeInTheDocument();
    expect(onAplicarCodigo).not.toHaveBeenCalled();

    escribir("Ingresa tu código (opcional)", "ROCK20");
    fireEvent.click(aplicar);
    expect(onAplicarCodigo).toHaveBeenCalledWith("ROCK20");
  });
});
