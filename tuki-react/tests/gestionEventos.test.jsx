import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EditarEvento from "../src/components/EditarEvento";
import GestionEventos from "../src/components/GestionEventos";
import PaginaAdmin from "../src/pages/PaginaAdmin";
import {
  actualizarEvento,
  eliminarEvento,
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

  it("no actualiza con datos inválidos ni un evento inexistente", () => {
    const creado = guardarEvento(datosValidos);

    expect(() =>
      actualizarEvento(creado.id, { ...datosValidos, nombre: "  " }),
    ).toThrow("Datos inválidos");
    expect(() => actualizarEvento("no-existe", datosValidos)).toThrow(
      "Evento no encontrado",
    );
    expect(leerEventosCreados()[0].nombre).toBe("Concierto de prueba");
  });

  it("elimina solo el evento indicado", () => {
    const primero = guardarEvento(datosValidos);
    const segundo = guardarEvento({ ...datosValidos, nombre: "Otro evento" });

    expect(eliminarEvento(primero.id)).toBe(true);
    expect(eliminarEvento("no-existe")).toBe(false);
    expect(leerEventosCreados().map((evento) => evento.id)).toEqual([segundo.id]);
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

  it("no elimina si se cancela la confirmación", () => {
    guardarEvento(datosValidos);
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<GestionEventos />);

    fireEvent.click(
      screen.getByRole("button", { name: "Eliminar Concierto de prueba" }),
    );

    expect(screen.getByText("Concierto de prueba")).toBeInTheDocument();
    expect(leerEventosCreados()).toHaveLength(1);
  });

  it("carga el evento en el formulario y guarda la edición", () => {
    const creado = guardarEvento(datosValidos);
    render(<EditarEvento id={creado.id} />);
    const nombre = screen.getByLabelText("Nombre del evento");
    expect(nombre).toHaveValue("Concierto de prueba");
    expect(screen.getByLabelText("Fecha")).toHaveValue("2026-11-20");
    expect(screen.getByLabelText("Hora")).toHaveValue("20:00");

    fireEvent.change(nombre, { target: { value: "Concierto editado" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(screen.getByRole("status")).toHaveTextContent("Evento actualizado.");
    expect(leerEventosCreados()[0].nombre).toBe("Concierto editado");
  });

  it("avisa cuando el evento a editar no existe", () => {
    render(<EditarEvento id="no-existe" />);

    expect(screen.getByText("Evento no encontrado")).toBeInTheDocument();
  });

  it("el panel muestra la sección pedida y marca su enlace", () => {
    const creado = guardarEvento(datosValidos);
    const { rerender } = render(<PaginaAdmin seccion="eventos" />);
    expect(
      screen.getByRole("heading", { name: "Gestionar eventos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Gestionar eventos" }),
    ).toHaveAttribute("aria-current", "page");

    rerender(<PaginaAdmin seccion="editar-evento" eventoId={creado.id} />);
    expect(
      screen.getByRole("heading", { name: "Editar evento" }),
    ).toBeInTheDocument();

    rerender(<PaginaAdmin seccion="seccion-desconocida" />);
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });
});
