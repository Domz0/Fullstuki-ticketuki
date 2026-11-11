package com.ticketuki.common.audit;

import com.fasterxml.jackson.databind.*;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.context.request.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Aspect
@Order(1)
public class AuditoriaAspect {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final String origen;
    public AuditoriaAspect(JdbcTemplate jdbc, ObjectMapper mapper, String origen) {
        this.jdbc = jdbc;
        this.mapper = mapper;
        this.origen = origen;
    }
    private Long identidad(String header) {
        var attrs = RequestContextHolder.getRequestAttributes();
        if (!(attrs instanceof ServletRequestAttributes servlet)) return null;
        String value = servlet.getRequest().getHeader(header);
        try { return value == null ? null : Long.valueOf(value); }
        catch (NumberFormatException ex) { return null; }
    }
    private JsonNode campo(Object resultado, String path) {
        JsonNode node = mapper.valueToTree(resultado);
        for (String parte : path.split("\\.")) node = node.path(parte);
        return node;
    }
    @Around("@annotation(auditar)")
    public Object registrar(ProceedingJoinPoint llamada, Auditar auditar) throws Throwable {
        if (!TransactionSynchronizationManager.isActualTransactionActive())
            throw new IllegalStateException("La auditoría requiere una transacción local");
        Object resultado = llamada.proceed();
        if (!auditar.condicion().isEmpty() && !campo(resultado, auditar.condicion()).asBoolean()) return resultado;
        Long id = auditar.id().isEmpty()
            ? ((Number) llamada.getArgs()[auditar.argumento()]).longValue()
            : campo(resultado, auditar.id()).longValue();
        if (id == null || id <= 0) throw new IllegalStateException("Identificador de auditoría inválido");
        var evento = new EventoAuditoria(UUID.randomUUID().toString(), origen, auditar.entidad(), id,
            auditar.accion(), identidad("X-Usuario-Id"), identidad("X-Auth-Id"), LocalDateTime.now(),
            llamada.getSignature().getName());
        jdbc.update("INSERT INTO auditoria_pendiente (id, payload, creado) VALUES (?, ?, ?)",
            evento.eventoId(), mapper.writeValueAsString(evento), java.sql.Timestamp.valueOf(evento.fecha()));
        return resultado;
    }
}
