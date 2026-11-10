import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PaginaPago from "../src/pages/PaginaPago";
import PaginaPagoFallido from "../src/pages/PaginaPagoFallido";
import { crearSeleccion, guardarCompra, leerCompra } from "../src/utils/compra";
import { leerCompras } from "../src/utils/entradas";

const evento = { id: "prueba", nombre: "Evento de prueba", recinto: "Estadio Nacional" };
const fecha = { id: "principal", dia: "14", mes: "nov", horario: "20:00" };
const sector = { id: "cancha", nombre: "Cancha General", precio: 10000 };

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

function pagarConCredito(container, vencimiento) {
  fireEvent.click(screen.getByRole("radio", { name: /Crédito/ }));
  escribir("Dígitos de tarjeta", "4000 0000 0000 0000");
  escribir("Fecha de vencimiento", vencimiento);
  escribir("CVV", "123");
  fireEvent.submit(container.querySelector("#formulario_pago"));
}

function rechazarPago() {
  guardarCompra(crearSeleccion(evento, fecha, sector, 2));
  const { container } = render(<PaginaPago evento={evento} fecha={fecha} />);
  escribir("Nombre", "Ana");
  escribir("Apellido", "Rojas");
  escribir("RUT", "12345678-5");
  escribir("Correo electrónico", "ana@duoc.cl");
  pagarConCredito(container, "12/25");
  cleanup();
}

describe("Pago rechazado", () => {
  it("rechaza una tarjeta vencida sin guardar entradas", () => {
    rechazarPago();

    expect(leerCompra()).toMatchObject({
      estado: "rechazada",
      motivo: "Tarjeta vencida",
      total: 22000,
    });
    expect(leerCompra().comprador.nombre).toBe("Ana");
    expect(leerCompras()).toHaveLength(0);
    expect(window.location.hash).toBe("#/pago-fallido/prueba?fecha=principal");
  });

  it("reintentar conserva los datos, pide la tarjeta y guarda una sola entrada", () => {
    rechazarPago();
    render(<PaginaPagoFallido evento={evento} fecha={fecha} />);
    fireEvent.click(screen.getByRole("button", { name: "Reintentar pago" }));
    expect(window.location.hash).toBe("#/pago/prueba?fecha=principal");
    cleanup();

    const { container } = render(<PaginaPago evento={evento} fecha={fecha} />);
    expect(screen.getByLabelText("Nombre")).toHaveValue("Ana");
    fireEvent.click(screen.getByRole("radio", { name: /Crédito/ }));
    expect(screen.getByLabelText("Dígitos de tarjeta")).toHaveValue("");
    pagarConCredito(container, "12/99");

    expect(leerCompra().estado).toBe("confirmada");
    expect(leerCompra().motivo).toBeUndefined();
    expect(leerCompras()).toHaveLength(1);
  });
});
