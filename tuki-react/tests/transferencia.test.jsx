import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import PaginaTransferir from "../src/pages/PaginaTransferir";
import { obtenerEntradas } from "../src/utils/entradas";

const usuario = { rut: "12345678-5" };

describe("Formulario de transferencia", () => {
  beforeEach(() => {
    localStorage.setItem(
      "compras",
      JSON.stringify([
        {
          orden: "TKI-ORDEN",
          codigo: "TKI-ABC",
          estado: "confirmada",
          eventoId: "1",
          evento: "Festival de rock en vivo",
          recinto: "Estadio Nacional",
          fecha: "14 nov",
          area: "Cancha General",
          cantidad: 2,
          titularRut: "12345678-5",
        },
      ]),
    );
  });

  it("muestra errores y no transfiere con datos inválidos", () => {
    render(<PaginaTransferir usuario={usuario} codigo="TKI-ABC" />);
    fireEvent.change(screen.getByLabelText("RUT"), {
      target: { value: "12.345.678-5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Transferir entrada" }));

    expect(screen.getByText("Ingresa el nombre del nuevo titular")).toBeInTheDocument();
    expect(screen.getByText("No puedes transferirte la entrada a ti mismo")).toBeInTheDocument();
    expect(screen.getByText("Ingresa el correo del nuevo titular")).toBeInTheDocument();
    expect(obtenerEntradas(usuario)[0].estado).toBe("proximas");
  });

  it("transfiere la entrada y la marca como transferida", () => {
    render(<PaginaTransferir usuario={usuario} codigo="TKI-ABC" />);
    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Camila Soto" },
    });
    fireEvent.change(screen.getByLabelText("RUT"), {
      target: { value: "11.111.111-1" },
    });
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "camila@gmail.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Transferir entrada" }));

    expect(screen.getByRole("status")).toHaveTextContent("Camila Soto");
    expect(obtenerEntradas(usuario)[0]).toMatchObject({
      estado: "transferidas",
      rotulo: "Transferida a camila@gmail.com",
    });
  });
});
