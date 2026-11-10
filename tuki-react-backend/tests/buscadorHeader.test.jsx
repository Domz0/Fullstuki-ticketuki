import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Header from "../src/components/Header";

function buscar(texto) {
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: texto } });
  fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
}

describe("Formulario de búsqueda del Header", () => {
  it("busca en la categoría actual y codifica el texto", () => {
    render(<Header categoria="artes" />);
    buscar("rock & roll");

    // El & solo queda como %26 si el componente codifica el texto.
    expect(window.location.hash).toBe("#/catalogo/artes?q=rock%20%26%20roll");
  });

  it("busca en música cuando no hay categoría", () => {
    render(<Header />);
    buscar("rock");

    expect(window.location.hash).toBe("#/catalogo/musica?q=rock");
  });
});
