package com.ticketuki.ventaservice.pago.service;

import com.ticketuki.ventaservice.pago.dto.PagoRequestDTO;
import com.ticketuki.ventaservice.pago.model.*;
import com.ticketuki.ventaservice.pago.repository.PagoRepository;
import com.ticketuki.ventaservice.model.Venta;
import com.ticketuki.ventaservice.repository.VentaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.*;
import org.springframework.http.*;
import reactor.core.publisher.Mono;
import java.time.*;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class PagoServiceTest {
    PagoRepository pagos = mock(PagoRepository.class);
    VentaRepository ventas = mock(VentaRepository.class);
    PagoService service;
    Venta venta;

    @BeforeEach
    void setup() {
        service = new PagoService(pagos, ventas, null, null);
        venta = new Venta(5L, LocalDateTime.now(), "CREDITO", "AUTH", 25800L, 1L, null, null);
        when(ventas.findForUpdate(5L)).thenReturn(Optional.of(venta));
        when(pagos.save(any(Pago.class))).thenAnswer(i -> i.getArgument(0));
    }

    Pago pago(EstadoPago estado) {
        return new Pago(1L, 25800L, MedioPago.CREDITO, "AUTH", LocalDateTime.now(), estado, 5L, 3L);
    }

    @Test
    void completarActualizaPagoYVenta() {
        when(pagos.findForUpdate(1L)).thenReturn(Optional.of(pago(EstadoPago.PENDIENTE)));
        assertThat(service.completarPago(1L).getEstado()).isEqualTo(EstadoPago.COMPLETADO);
        assertThat(venta.getEstado_venta_id_estado()).isEqualTo(2L);
        verify(ventas).save(venta);
    }

    @Test
    void noCompletaPagoYaCompletado() {
        when(pagos.findForUpdate(1L)).thenReturn(Optional.of(pago(EstadoPago.COMPLETADO)));
        assertThatThrownBy(() -> service.completarPago(1L)).isInstanceOf(IllegalStateException.class);
        verify(pagos, never()).save(any());
    }

    @Test
    void noReembolsaPagoPendiente() {
        when(pagos.findForUpdate(1L)).thenReturn(Optional.of(pago(EstadoPago.PENDIENTE)));
        assertThatThrownBy(() -> service.procesarReembolso(1L)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void rechazaMontoDistintoAlTotal() {
        assertThatThrownBy(() -> service.procesarPago(new PagoRequestDTO(1L, MedioPago.CREDITO, "AUTH", 5L, 3L)))
            .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("monto");
        verify(pagos, never()).save(any());
    }

    @Test
    void rechazaPagoDuplicado() {
        when(pagos.findByVenta_id(5L)).thenReturn(List.of(pago(EstadoPago.PENDIENTE)));
        assertThatThrownBy(() -> service.procesarPago(new PagoRequestDTO(25800L, MedioPago.CREDITO, "AUTH", 5L, 3L)))
            .isInstanceOf(IllegalStateException.class).hasMessageContaining("activo");
        verify(pagos, never()).save(any());
    }

    @Test
    void rechazaVentaInexistente() {
        when(ventas.findForUpdate(5L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.procesarPago(new PagoRequestDTO(25800L, MedioPago.CREDITO, "AUTH", 5L, 3L)))
            .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("no encontrada");
    }

    @Test
    void rechazaPeriodoInvertido() {
        assertThatThrownBy(() -> service.listarPorPeriodo(LocalDate.of(2026, 6, 30), LocalDate.of(2026, 1, 1)))
            .isInstanceOf(IllegalArgumentException.class);
    }
    @Test
    void completarNoNecesitaServiciosHttp() {
        WebClient prohibido = WebClient.builder().exchangeFunction(r -> {
            throw new AssertionError("Completar pago no debe consultar servicios HTTP");
        }).build();
        service = new PagoService(pagos, ventas, prohibido, prohibido);
        when(pagos.findForUpdate(1L)).thenReturn(Optional.of(pago(EstadoPago.PENDIENTE)));
        assertThat(service.completarPago(1L).getEstado()).isEqualTo(EstadoPago.COMPLETADO);
        verify(ventas).save(venta);
    }

    @Test
    void ventaCanceladaNoPermiteCompletarPago() {
        venta.setEstado_venta_id_estado(3L);
        when(pagos.findForUpdate(1L)).thenReturn(Optional.of(pago(EstadoPago.PENDIENTE)));
        assertThatThrownBy(() -> service.completarPago(1L)).isInstanceOf(IllegalStateException.class);
        verify(pagos, never()).save(any());
    }

    @Test
    void reembolsoActualizaPagoYVenta() {
        WebClient tickets = WebClient.builder().exchangeFunction(r -> Mono.just(
                ClientResponse.create(HttpStatus.OK).header("Content-Type", "application/json")
                    .body(r.url().getPath().equals("/estadosTicket")
                        ? "[{\"id\":3,\"nombre\":\"CANCELADO\"}]" : "[]").build())).build();
        service = new PagoService(pagos, ventas, null, tickets);
        venta.setEstado_venta_id_estado(2L);
        when(pagos.findForUpdate(1L)).thenReturn(Optional.of(pago(EstadoPago.COMPLETADO)));
        assertThat(service.procesarReembolso(1L).getEstado()).isEqualTo(EstadoPago.REEMBOLSADO);
        assertThat(venta.getEstado_venta_id_estado()).isEqualTo(4L);
        verify(ventas).save(venta);
    }
}
