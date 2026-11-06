import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CrearEvento from "../src/components/CrearEvento";
import PaginaCatalogo from "../src/pages/PaginaCatalogo";

function completar(fecha) {
  fireEvent.change(screen.getByLabelText("Nombre del evento"), {
    target: { value: "Concierto de tukis" },
  });
  fireEvent.change(screen.getByLabelText("Subcategoría"), {
    target: { value: "Rock" },
  });
  fireEvent.change(screen.getByLabelText("Fecha"), {
    target: { value: fecha },
  });
  fireEvent.change(screen.getByLabelText("Hora"), {
    target: { value: "20:00" },
  });
  fireEvent.change(screen.getByLabelText("Descripción"), {
    target: { value: "concierto de tukis." },
  });
}

describe("Creacion de eventos", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 6, 12));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("rechaza campos vacíos", () => {
    render(<CrearEvento />);
    fireEvent.click(screen.getByRole("button", { name: "Crear evento" }));
    expect(screen.getByText("Ingresa el nombre.")).toBeInTheDocument();
    expect(screen.getByText("Elige una subcategoría.")).toBeInTheDocument();
    expect(
      screen.getByText("Elige una fecha y hora futuras."),
    ).toBeInTheDocument();
    expect(screen.getByText("Ingresa una descripción.")).toBeInTheDocument();
    expect(localStorage.getItem("eventosCreados")).toBeNull();
  });

  it("no es fecha pasada", () => {
    render(<CrearEvento />);
    completar("2026-11-05");
    fireEvent.click(screen.getByRole("button", { name: "Crear evento" }));
    expect(
      screen.getByText("Elige una fecha y hora futuras."),
    ).toBeInTheDocument();
    expect(localStorage.getItem("eventosCreados")).toBeNull();
  });

  it("guarda y muestra?", () => {
    const { unmount } = render(<CrearEvento />);
    completar("2026-11-20");
    fireEvent.click(screen.getByRole("button", { name: "Crear evento" }));
    expect(screen.getByRole("status")).toHaveTextContent("Evento creado.");
    const guardados = JSON.parse(localStorage.getItem("eventosCreados"));
    expect(guardados).toHaveLength(1);
    expect(guardados[0]).toMatchObject({
      nombre: "Concierto de tukis",
      categoria: "musica",
      recinto: "Estadio Nacional",
    });
    expect(guardados[0].fechas[0].horario).toBe("20:00");
    unmount();
    render(<PaginaCatalogo categoria="musica" busqueda="" />);
    expect(screen.getByText("Concierto de tukis")).toBeInTheDocument();
    expect(screen.getByText("Festival de rock en vivo")).toBeInTheDocument();
  });
});
