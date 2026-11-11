package com.ticketuki.historialservice.service;

import com.ticketuki.historialservice.dto.EventoInternoDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditoriaInternaService {
    private final JdbcTemplate jdbc;
    public AuditoriaInternaService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Transactional
    public void registrar(EventoInternoDTO dto) {
        jdbc.update("""
            INSERT INTO historial (evento_id, origen, entidad, id_entidad, accion, usuario_id, auth_id, timestamp, cambios_nuevos)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE evento_id = evento_id
            """, dto.eventoId(), dto.origen(), dto.entidad().name(), dto.idEntidad(), dto.accion().name(),
            dto.usuarioId(), dto.authId(), java.sql.Timestamp.valueOf(dto.fecha()), dto.operacion());
    }
}
