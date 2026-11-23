import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FormularioPago from "../src/components/compras/FormularioPago";

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

function completarComprador() {
  escribir("Primer nombre", "Ana");
  escribir("Apellido paterno", "Rojas");
  escribir("RUT", "12345678-5");
  escribir("Correo electrónico", "ana@duoc.cl");
}

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
    expect(screen.getByText("Usa el formato 12.345.678-5 o 12345678-5")).toBeInTheDocument();
    expect(screen.getByText("Usa un correo de duoc.cl, gmail.com, duocuc.cl o profesor.duoc.cl")).toBeInTheDocument();
    expect(screen.getByText("Revisa los campos marcados.")).toBeInTheDocument();
    expect(onValidado).not.toHaveBeenCalled();
  });

  it("pide los datos de la tarjeta al pagar con credito y envia las cuotas", () => {
    const onValidado = vi.fn();
    const { container } = render(<FormularioPago onValidado={onValidado} />);
    completarComprador();
    fireEvent.click(screen.getByRole("radio", { name: /Crédito/ }));

    enviar(container);
    expect(screen.getByText("La tarjeta debe tener 16 números; puedes separarlos con espacios")).toBeInTheDocument();
    expect(screen.getByText("Usa MM/AA con un mes entre 01 y 12")).toBeInTheDocument();
    expect(screen.getByText("El CVV debe tener 3 o 4 números")).toBeInTheDocument();
    expect(onValidado).not.toHaveBeenCalled();

    escribir("Dígitos de tarjeta", "4000 0000 0000 0000");
    escribir("Fecha de vencimiento", "12/99");
    escribir("CVV", "123");
    fireEvent.click(screen.getByRole("button", { name: "3 cuotas" }));
    enviar(container);

    expect(onValidado).toHaveBeenCalledWith(expect.objectContaining({ cvv: "123" }), "credito", 3);
  });
});
