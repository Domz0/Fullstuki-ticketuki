import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ResumenPago from "../src/components/ResumenPago";
import { calcularTotales } from "../src/utils/compra";

const props = {
  evento: { nombre: "Concierto", recinto: "Estadio Nacional" },
  fecha: { dia: "14", mes: "nov", horario: "20:00" },
  seleccion: { area: "Cancha", precio: 10000 },
  cantidad: 2,
};

describe("Resumen de pago", () => {
  it("muestra el resumen correspondiente", () => {
    render(<ResumenPago {...props} />);
    expect(screen.getByText("$20.000")).toBeInTheDocument();
    expect(screen.getByText("$2.000")).toBeInTheDocument();
    expect(screen.getByText("$22.000")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continuar · $22.000" }),
    ).toBeInTheDocument();
  });

  it("aplica ROCK20 al total con cargo sin acumular el descuento al renderizar", () => {
    const { rerender } = render(<ResumenPago {...props} codigo="ROCK20" />);
    expect(screen.getByText("-$4.400")).toBeInTheDocument();
    expect(screen.getByText("$17.600")).toBeInTheDocument();
    rerender(<ResumenPago {...props} codigo="ROCK20" />);
    expect(
      screen.getByRole("button", { name: "Continuar · $17.600" }),
    ).toBeInTheDocument();
  });

  it("no descuenta un código inválido", () => {
    expect(calcularTotales(10000, 2, "OTRO")).toEqual({
      subtotal: 20000,
      cargo: 2000,
      descuento: 0,
      total: 22000,
    });
  });
});
