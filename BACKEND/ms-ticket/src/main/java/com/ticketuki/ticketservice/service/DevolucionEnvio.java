package com.ticketuki.ticketservice.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.*;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import lombok.extern.slf4j.Slf4j;

@Component
@EnableScheduling
@Slf4j
public class DevolucionEnvio {
    private final JdbcTemplate jdbc;
    private final WebClient ventas;
    public DevolucionEnvio(JdbcTemplate jdbc, @Qualifier("ventaWebClient") WebClient ventas) {
        this.jdbc = jdbc; this.ventas = ventas;
    }
    @Scheduled(fixedDelayString="${devoluciones.reintento-ms:10000}", initialDelay=15000)
    public void pendientes() {
        jdbc.queryForList("SELECT ticket_id FROM devolucion_pendiente WHERE enviada_en IS NULL ORDER BY creada_en LIMIT 50", Long.class)
                .forEach(this::enviar);
    }
    public void enviar(Long id) {
        try {
            if (jdbc.queryForList("SELECT ticket_id FROM devolucion_pendiente WHERE ticket_id=? AND enviada_en IS NULL", id).isEmpty()) return;
            ventas.post().uri("/interno/devoluciones/{id}", id).retrieve().toBodilessEntity().block(java.time.Duration.ofSeconds(10));
            jdbc.update("UPDATE devolucion_pendiente SET enviada_en=CURRENT_TIMESTAMP(6) WHERE ticket_id=? AND enviada_en IS NULL", id);
        } catch (org.springframework.web.reactive.function.client.WebClientException | IllegalStateException error) {
            log.warn("Reembolso de entrada {} pendiente de sincronización: {}", id, error.getClass().getSimpleName());
        }
    }
}
