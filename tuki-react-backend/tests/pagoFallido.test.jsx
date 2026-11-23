import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PaginaPago from "../src/pages/PaginaPago";
import { adaptarEvento } from "../src/services/eventos";
import { crearSeleccion, guardarCompra, leerCompra } from "../src/utils/compra";

const eventoApi = {
  id_evento: 7,
  nombre_evento: "Evento de prueba",
  fecha_evento: "2099-11-14",
  horario: "20:00",
  estado_evento_id_estado: 2,
  categoria: "musica",
  recinto_catalogo: "Estadio Nacional",
  descripcion: "Evento usado en las pruebas",
};
const disponibilidadApi = {
  evento_id: 7,
  capacidad_total: 300,
  disponibles: 200,
  venta_habilitada: true,
  estado: "DISPONIBLE",
  sectores: [
    { id: 1, nombre: "Cancha Preferencial", plano_id: "cancha-preferencial", precio: 85000, capacidad: 100, disponibles: 100 },
    { id: 2, nombre: "Cancha General", plano_id: "cancha-general", precio: 45000, capacidad: 100, disponibles: 100 },
    { id: 3, nombre: "Tribuna Pacífico", plano_id: "tribuna-pacifico", precio: 30000, capacidad: 100, disponibles: 0 },
  ],
};

const evento = adaptarEvento(eventoApi);
const fecha = evento.fechas[0];
const canchaGeneral = disponibilidadApi.sectores[1];

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

function abrirPago() {
  const resultado = render(<PaginaPago evento={evento} fecha={fecha} />);
  return resultado.container;
}

function pagarConCredito(container, vencimiento) {
  fireEvent.click(screen.getByRole("radio", { name: /Crédito/ }));
  escribir("Dígitos de tarjeta", "4000 0000 0000 0000");
  escribir("Fecha de vencimiento", vencimiento);
  escribir("CVV", "123");
  fireEvent.submit(container.querySelector("#formulario_pago"));
}

function completarComprador() {
  escribir("Primer nombre", "Ana");
  escribir("Apellido paterno", "Rojas");
  escribir("RUT", "12345678-5");
  escribir("Correo electrónico", "ana@duoc.cl");
}

// el pago consulta cupos, confirma el pago simulado y pide el resultado
function mockCompraExitosa() {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async url => {
    if (url === "/api/v1/compras/publicas") return Response.json({ id: 10, estado: "PENDIENTE_PAGO", reserva_estado: "RESERVADA" });
    if (url === "/api/v1/compras/publicas/10/confirmar-simulado") return Response.json({ id: 10, estado: "COMPLETADA" });
    if (url === "/api/v1/compras/publicas/10/resultado") {
      return Response.json({
        venta_id: 55,
        total: 116100,
        correo_enviado: true,
        tickets: [{ id_ticket: 1, cod_qr: "TKI-A" }, { id_ticket: 2, cod_qr: "TKI-B" }],
      });
    }
    if (url === "/api/v1/tickets/disponibilidad/evento/7") return Response.json(disponibilidadApi);
    return Response.json(eventoApi);
  });
}

describe("Pago aprobado", () => {
  it("registra la compra en el backend y muestra la confirmación", async () => {
    const fetchMock = mockCompraExitosa();
    guardarCompra(crearSeleccion(evento, fecha, canchaGeneral, 2));
    const container = abrirPago();

    completarComprador();
    pagarConCredito(container, "12/99");

    await vi.waitFor(() => expect(window.location.hash).toBe("#/confirmacion/7?fecha=principal"));
    const [, opciones] = fetchMock.mock.calls.find(([url]) => url === "/api/v1/compras/publicas");
    expect(opciones.method).toBe("POST");
    expect(JSON.parse(opciones.body)).toMatchObject({
      evento: 7,
      sector: 2,
      cantidad: 2,
      nombre: "Ana Rojas",
      rut: "12.345.678-5",
      correo: "ana@duoc.cl",
      medio: "CREDITO",
    });

    expect(leerCompra()).toMatchObject({ estado: "confirmada", operacionBackend: { id: 10, estado: "COMPLETADA" } });
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/compras/publicas/10/resultado", expect.anything());
  });
});
