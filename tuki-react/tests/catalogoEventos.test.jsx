import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CatalogoEventos from "../src/components/CatalogoEventos";

function evento(id, nombre, categoria) {
  return {
    id,
    nombre,
    categoria,
    subcategoria: "General",
    recinto: "Movistar Arena",
    ciudad: "Santiago",
    detalle: "Movistar Arena · Sáb 14 nov",
    estado: "Disponible",
    precio: 10000,
    plazo: id,
  };
}

const eventos = [
  evento(1, "Concierto uno", "musica"),
  evento(2, "Concierto dos", "musica"),
  evento(3, "Obra de teatro", "artes"),
];

describe("Lista del catálogo", () => {
  it("renderiza todos los eventos de la categoría", () => {
    render(<CatalogoEventos eventos={eventos} categoria="musica" />);

    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getByText("Concierto uno")).toBeInTheDocument();
    expect(screen.getByText("Concierto dos")).toBeInTheDocument();
    expect(screen.queryByText("Obra de teatro")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("2 eventos en Música");
  });
});
