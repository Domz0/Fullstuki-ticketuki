import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GestionEventos from "../src/components/GestionEventos";
import {
  actualizarEvento,
  guardarEvento,
  leerEventosCreados,
} from "../src/utils/eventos";

const datosValidos = {
  nombre: "Concierto de prueba",
  categoria: "musica",
  subcategoria: "Rock",
  recinto: "Estadio Nacional",
  ciudad: "Santiago",
  fecha: "2026-11-20",
  hora: "20:00",
  descripcion: "Descripción de prueba",
};

describe("CRUD de eventos", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 6, 12));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("actualiza un evento conservando su identificador", () => {
    const creado = guardarEvento(datosValidos);
    const actualizado = actualizarEvento(creado.id, {
      ...datosValidos,
      nombre: "Nombre nuevo",
      hora: "21:30",
    });

    expect(actualizado.id).toBe(creado.id);
    expect(leerEventosCreados()).toHaveLength(1);
    expect(leerEventosCreados()[0]).toMatchObject({ nombre: "Nombre nuevo" });
    expect(leerEventosCreados()[0].fechas[0].horario).toBe("21:30");
  });

  it("lista los eventos y elimina al confirmar", () => {
    guardarEvento(datosValidos);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<GestionEventos />);
    expect(screen.getByText("Concierto de prueba")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Eliminar Concierto de prueba" }),
    );

    expect(screen.getByRole("status")).toHaveTextContent("Evento eliminado.");
    expect(screen.queryByText("Concierto de prueba")).not.toBeInTheDocument();
    expect(leerEventosCreados()).toHaveLength(0);
  });
});
