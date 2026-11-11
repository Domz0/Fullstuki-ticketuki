package com.ticketuki.common.audit;
import java.time.LocalDateTime;
public record EventoAuditoria(String eventoId, String origen, String entidad, Long idEntidad,
        String accion, Long usuarioId, Long authId, LocalDateTime fecha, String operacion) {}
