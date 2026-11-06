import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PaginaEntradas from "../src/pages/PaginaEntradas";

const evento = {
  id: "prueba",
  nombre: "Evento de prueba",
  recinto: "Estadio Nacional",
};
const fecha = {
  id: "principal",
  dia: "14",
  mes: "nov",
  horario: "20:00",
  estado: "Disponible",
};

describe("Selección de entradas", () => {
  it("cambia al elegir sector", () => {
    render(<PaginaEntradas evento={evento} fecha={fecha} />);
    expect(
      screen.queryByLabelText("Cantidad seleccionada"),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /Cancha Preferencial/ }),
    );

    expect(
      screen.queryByRole("button", { name: /Cancha General/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Cantidad seleccionada")).toHaveTextContent(
      "1",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Agregar una entrada" }),
    );
    expect(screen.getByLabelText("Cantidad seleccionada")).toHaveTextContent(
      "2",
    );
    expect(screen.getByText("$187.000")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continuar al pago" }));

    expect(JSON.parse(localStorage.getItem("compraActual"))).toMatchObject({
      eventoId: "prueba",
      sectorId: "cancha-preferencial",
      cantidad: 2,
      precio: 85000,
    });
    expect(window.location.hash).toBe("#/pago/prueba?fecha=principal");
  });

  it("limita la cantidad entre una y seis entradas", () => {
    render(<PaginaEntradas evento={evento} fecha={fecha} />);
    fireEvent.click(screen.getByRole("button", { name: /Cancha General/ }));
    const quitar = screen.getByRole("button", { name: "Quitar una entrada" });
    const agregar = screen.getByRole("button", { name: "Agregar una entrada" });
    expect(quitar).toBeDisabled();
    fireEvent.click(quitar);
    expect(screen.getByLabelText("Cantidad seleccionada")).toHaveTextContent(
      "1",
    );
    for (let i = 0; i < 6; i++) fireEvent.click(agregar);
    expect(screen.getByLabelText("Cantidad seleccionada")).toHaveTextContent(
      "6",
    );
    expect(agregar).toBeDisabled();
    for (let i = 0; i < 6; i++) fireEvent.click(quitar);
    expect(screen.getByLabelText("Cantidad seleccionada")).toHaveTextContent(
      "1",
    );
    expect(quitar).toBeDisabled();
  });

  it("no permite seleccionar un sector agotado", () => {
    render(<PaginaEntradas evento={evento} fecha={fecha} />);
    const agotado = screen.getByRole("button", { name: /Tribuna Pacífico/ });
    expect(agotado).toBeDisabled();
    fireEvent.click(agotado);
    expect(
      screen.queryByLabelText("Cantidad seleccionada"),
    ).not.toBeInTheDocument();
    expect(localStorage.getItem("compraActual")).toBeNull();
  });
});
