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
        var ids = jdbc.queryForList("SELECT pago_id FROM pago_tarea WHERE estado='PENDIENTE' ORDER BY intentos, pago_id LIMIT 50", Long.class);
        for (Long id : ids) {
            try { procesar(id); }
            catch (Exception ex) { log.warn("La operación del pago {} queda pendiente para reintento", id); }
        }
    }

    public void procesar(Long id) {
        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            var pago = pagos.findForUpdate(id).orElseThrow();
            var filas = jdbc.queryForList("SELECT tipo, estado FROM pago_tarea WHERE pago_id=? FOR UPDATE", id);
            if (filas.isEmpty() || !"PENDIENTE".equals(filas.getFirst().get("estado"))) return;
            String tipo = filas.getFirst().get("tipo").toString();
            jdbc.update("UPDATE pago_tarea SET intentos=intentos+1 WHERE pago_id=?", id);
            try {
                if ("EMITIR".equals(tipo)) {
                    String solicitud = jdbc.queryForObject("SELECT solicitud FROM compra WHERE pago_id=?", String.class, id);
                    tickets.emitir(pago.getVenta_id(), solicitud);
                } else {
                    tickets.cancelar(pago.getVenta_id());
                    pagoService.finalizarCancelacion(id, "REEMBOLSAR".equals(tipo));
                }
                jdbc.update("UPDATE pago_tarea SET estado='HECHA', mensaje=NULL WHERE pago_id=?", id);
            } catch (WebClientResponseException ex) {
                if (Set.of(400,404,409,422).contains(ex.getStatusCode().value())) {
                    if ("EMITIR".equals(tipo))
                        jdbc.update("UPDATE pago_tarea SET tipo='REEMBOLSAR', mensaje=? WHERE pago_id=?",
                                "No se pudo emitir la compra; reembolso simulado pendiente", id);
                    else
                        jdbc.update("UPDATE pago_tarea SET estado='RECHAZADA', mensaje=? WHERE pago_id=?",
                                "No se pudo cancelar: revisar tickets usados o datos de la venta", id);
                } else {
                    jdbc.update("UPDATE pago_tarea SET mensaje=? WHERE pago_id=?", "Servicio no disponible; se reintentará", id);
                }
            } catch (org.springframework.web.reactive.function.client.WebClientRequestException
                     | org.springframework.web.server.ResponseStatusException ex) {
                jdbc.update("UPDATE pago_tarea SET mensaje=? WHERE pago_id=?", "Servicio no disponible; se reintentará", id);
            } catch (IllegalStateException ex) {
                // El timeout puede ocurrir después de que tickets confirme: repetir la misma operación es seguro.
                if (ex.getCause() instanceof java.util.concurrent.TimeoutException)
                    jdbc.update("UPDATE pago_tarea SET mensaje=? WHERE pago_id=?", "Respuesta pendiente; se reintentará", id);
                else throw ex;
            }
        });
    }
}
