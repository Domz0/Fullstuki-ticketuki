package com.ticketuki.ventaservice.service;

import com.ticketuki.ventaservice.client.TicketsCompraClient;
import com.ticketuki.ventaservice.pago.repository.PagoRepository;
import com.ticketuki.ventaservice.pago.service.PagoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import java.util.Set;

@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class CompraProcesador {
    private final JdbcTemplate jdbc;
    private final PagoRepository pagos;
    private final PagoService pagoService;
    private final TicketsCompraClient tickets;
    private final PlatformTransactionManager transactionManager;

    @Scheduled(fixedDelayString="${compras.reintento-ms:10000}", initialDelayString="${compras.inicio-ms:15000}")
    public void pendientes() {
        var ids = jdbc.queryForList("""
                SELECT pago_id FROM pago_tarea WHERE estado='PENDIENTE' OR (tipo='RESERVAR' AND estado='HECHA')
                ORDER BY revisada_en, pago_id LIMIT 50
                """, Long.class);
        for (Long id : ids) {
            try { procesar(id); }
            catch (Exception ex) { log.warn("La operación del pago {} queda pendiente para reintento", id); }
        }
    }

    private void siguiente(Long id, String tipo, String mensaje) {
        jdbc.update("UPDATE pago_tarea SET tipo=?, estado='PENDIENTE', mensaje=? WHERE pago_id=?", tipo, mensaje, id);
    }

    private void guardarReserva(Long id, TicketsCompraClient.Reserva reserva) {
        jdbc.update("UPDATE compra SET reserva_estado=?, reserva_hasta=? WHERE pago_id=?",
                reserva.estado(), reserva.vence_en(), id);
    }

    private void reservaNoDisponible(Long id, TicketsCompraClient.Reserva reserva) {
        guardarReserva(id, reserva);
        siguiente(id, "CANCELAR", "La reserva venció o no está disponible; cancelación pendiente");
    }

    public void procesar(Long id) {
        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            var pago = pagos.findForUpdate(id).orElseThrow();
            var filas = jdbc.queryForList("SELECT tipo, estado FROM pago_tarea WHERE pago_id=? FOR UPDATE", id);
            if (filas.isEmpty()) return;
            String tipo = filas.getFirst().get("tipo").toString();
            boolean pendiente = "PENDIENTE".equals(filas.getFirst().get("estado"));
            boolean revisarReserva = "RESERVAR".equals(tipo) && "HECHA".equals(filas.getFirst().get("estado"));
            if (!pendiente && !revisarReserva) return;
            jdbc.update("UPDATE pago_tarea SET intentos=intentos+?, revisada_en=CURRENT_TIMESTAMP(6) WHERE pago_id=?",
                    pendiente ? 1 : 0, id);
            try {
                if ("RESERVAR".equals(tipo)) {
                    var reserva = revisarReserva ? tickets.consultarReserva(pago.getVenta_id())
                            : tickets.reservar(pago.getVenta_id(),
                                jdbc.queryForObject("SELECT solicitud FROM compra WHERE pago_id=?", String.class, id));
                    if ("RESERVADA".equals(reserva.estado())) {
                        guardarReserva(id, reserva);
                    } else if (Set.of("VENCIDA", "CANCELADA").contains(reserva.estado())) {
                        reservaNoDisponible(id, reserva);
                        return;
                    } else {
                        throw new IllegalStateException("Estado de reserva inesperado");
                    }
                } else if ("CONFIRMAR".equals(tipo)) {
                    var reserva = tickets.confirmarReserva(pago.getVenta_id());
                    if (!"CONFIRMADA".equals(reserva.estado())) {
                        reservaNoDisponible(id, reserva);
                        return;
                    }
                    guardarReserva(id, reserva);
                    pagoService.confirmarPagoReservado(id);
                    siguiente(id, "EMITIR", null);
                    return;
                } else if ("EMITIR".equals(tipo)) {
                    String solicitud = jdbc.queryForObject("SELECT solicitud FROM compra WHERE pago_id=?", String.class, id);
                    tickets.emitir(pago.getVenta_id(), solicitud);
                    jdbc.update("UPDATE compra SET reserva_estado='CONSUMIDA' WHERE pago_id=? AND reserva_estado IS NOT NULL", id);
                } else if (Set.of("CANCELAR", "REEMBOLSAR").contains(tipo)) {
                    tickets.cancelar(pago.getVenta_id());
                    pagoService.finalizarCancelacion(id, "REEMBOLSAR".equals(tipo));
                    jdbc.update("""
                            UPDATE compra SET reserva_estado=CASE WHEN reserva_estado='VENCIDA' THEN 'VENCIDA' ELSE 'CANCELADA' END
                            WHERE pago_id=? AND reserva_estado IS NOT NULL
                            """, id);
                } else {
                    throw new IllegalStateException("Tipo de tarea desconocido");
                }
                jdbc.update("UPDATE pago_tarea SET estado='HECHA', mensaje=NULL WHERE pago_id=?", id);
            } catch (WebClientResponseException ex) {
                if (Set.of(400,404,409,410,422).contains(ex.getStatusCode().value())) {
                    if ("RESERVAR".equals(tipo) || "CONFIRMAR".equals(tipo)) {
                        jdbc.update("UPDATE compra SET reserva_estado='RECHAZADA' WHERE pago_id=?", id);
                        siguiente(id, "CANCELAR", "No se pudo reservar o confirmar los asientos; cancelación pendiente");
                    } else if ("EMITIR".equals(tipo)) {
                        siguiente(id, "REEMBOLSAR", "No se pudo emitir la compra; reembolso simulado pendiente");
                    } else {
                        jdbc.update("UPDATE pago_tarea SET estado='RECHAZADA', mensaje=? WHERE pago_id=?",
                                "No se pudo cancelar: revisar tickets usados o datos de la venta", id);
                    }
                } else {
                    jdbc.update("UPDATE pago_tarea SET mensaje=? WHERE pago_id=?", "Servicio no disponible; se reintentará", id);
                }
            } catch (org.springframework.web.reactive.function.client.WebClientRequestException
                     | org.springframework.web.server.ResponseStatusException ex) {
                jdbc.update("UPDATE pago_tarea SET mensaje=? WHERE pago_id=?", "Servicio no disponible; se reintentará", id);
            } catch (IllegalStateException ex) {
                // Una respuesta perdida se recupera repitiendo la misma operación, sin renovar la reserva.
                if (ex.getCause() instanceof java.util.concurrent.TimeoutException)
                    jdbc.update("UPDATE pago_tarea SET mensaje=? WHERE pago_id=?", "Respuesta pendiente; se reintentará", id);
                else throw ex;
            }
        });
    }
}
