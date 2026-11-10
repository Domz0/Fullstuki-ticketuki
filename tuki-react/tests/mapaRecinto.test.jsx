import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PaginaEntradas from "../src/pages/PaginaEntradas";

const evento = { id: "prueba", nombre: "Evento", recinto: "Estadio Nacional" };
const fecha = { id: "principal", dia: "14", mes: "nov", horario: "20:00", estado: "Disponible" };

describe("Mapa del recinto", () => {
  it("elige un sector desde el mapa y no ofrece los agotados", () => {
    render(<PaginaEntradas evento={evento} fecha={fecha} />);

    expect(
      screen.queryByRole("button", { name: /^Tribuna Pacífico,/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancha General, $45.000" }));

    expect(screen.getByLabelText("Cantidad seleccionada")).toHaveTextContent("1");
    expect(JSON.parse(localStorage.getItem("compraActual")).sectorId).toBe("cancha-general");
  });
});
