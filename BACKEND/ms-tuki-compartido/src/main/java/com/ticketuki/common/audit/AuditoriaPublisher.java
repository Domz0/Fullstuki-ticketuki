package com.ticketuki.common.audit;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.client.RestClient;
import org.springframework.http.MediaType;
import java.util.List;
import java.util.Map;

public class AuditoriaPublisher {
    private final JdbcTemplate jdbc;
    private final RestClient client;
    private final String key;
    public AuditoriaPublisher(JdbcTemplate jdbc, RestClient client, String key) {
        this.jdbc = jdbc;
        this.client = client;
        this.key = key;
    }
    @Scheduled(fixedDelayString = "${audit.delay-ms:10000}", initialDelayString = "${audit.initial-delay-ms:15000}")
    public void enviarPendientes() {
        if (key == null || key.isBlank()) return;
        List<Map<String, Object>> pendientes = jdbc.queryForList(
            "SELECT id, payload FROM auditoria_pendiente WHERE enviado IS NULL ORDER BY creado, id LIMIT 50");
        for (var fila : pendientes) {
            try {
                client.post().uri("/interno/historial").header("X-Internal-Key", key)
                    .contentType(MediaType.APPLICATION_JSON).body(fila.get("payload").toString()).retrieve().toBodilessEntity();
                jdbc.update("UPDATE auditoria_pendiente SET enviado = CURRENT_TIMESTAMP WHERE id = ?", fila.get("id"));
            } catch (Exception ex) {
                org.slf4j.LoggerFactory.getLogger(getClass()).warn("Historial pendiente; se reintentará el envío");
                break;
            }
        }
    }
}
