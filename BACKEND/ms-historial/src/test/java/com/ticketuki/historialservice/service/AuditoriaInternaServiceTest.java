package com.ticketuki.historialservice.service;

import com.ticketuki.historialservice.dto.EventoInternoDTO;
import com.ticketuki.historialservice.model.*;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import java.time.LocalDateTime;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;

class AuditoriaInternaServiceTest {
    @Test void entregaRepetidaNoDuplicaHistorial() {
        var jdbc = new JdbcTemplate(new DriverManagerDataSource("jdbc:h2:mem:" + UUID.randomUUID() + ";MODE=MariaDB;DB_CLOSE_DELAY=-1", "sa", ""));
        jdbc.execute("""
            CREATE TABLE historial (
              evento_id VARCHAR(36) UNIQUE, origen VARCHAR(50), entidad VARCHAR(50),
              id_entidad BIGINT, accion VARCHAR(50), usuario_id BIGINT, auth_id BIGINT,
              timestamp TIMESTAMP, cambios_nuevos TEXT)
            """);
        var service = new AuditoriaInternaService(jdbc);
        var dto = new EventoInternoDTO(UUID.randomUUID().toString(), "ms-venta", TipoEntidad.PAGO,
            3L, AccionHistorial.ACTUALIZAR, 2L, 1L, LocalDateTime.now(), "completarPago");
        service.registrar(dto);
        service.registrar(dto);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM historial", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT auth_id FROM historial", Long.class)).isEqualTo(1L);
    }
}
