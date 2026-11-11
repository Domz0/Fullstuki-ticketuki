package com.ticketuki.ventaservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PagoTareas {
    private final JdbcTemplate jdbc;

    public boolean esCompra(Long pago) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM compra WHERE pago_id=?", Long.class, pago) > 0;
    }

    public boolean cancelacionPendiente(Long pago) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM pago_tarea WHERE pago_id=? AND tipo IN ('CANCELAR','REEMBOLSAR') AND estado <> 'RECHAZADA'",
                Long.class, pago) > 0;
    }

    public void solicitar(Long pago, String tipo) {
        jdbc.update("""
                INSERT INTO pago_tarea(pago_id,tipo,estado) VALUES (?,?,'PENDIENTE')
                ON DUPLICATE KEY UPDATE estado=CASE WHEN tipo=VALUES(tipo) AND estado='HECHA' THEN 'HECHA' ELSE 'PENDIENTE' END,
                mensaje=NULL, tipo=VALUES(tipo)
                """, pago, tipo);
    }
}
