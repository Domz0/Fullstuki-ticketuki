package com.ticketuki.ticketservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OperacionVentaStore {
    private final JdbcTemplate jdbc;

    public record Operacion(String estado, String solicitud) {}

    public Operacion bloquear(Long venta) {
        jdbc.update("INSERT INTO operacion_venta(venta_id, estado) VALUES (?, 'ABIERTA') ON DUPLICATE KEY UPDATE venta_id=venta_id", venta);
        return jdbc.queryForObject("SELECT estado, solicitud FROM operacion_venta WHERE venta_id=? FOR UPDATE",
                (rs, n) -> new Operacion(rs.getString(1), rs.getString(2)), venta);
    }

    public void guardar(Long venta, String estado, String solicitud) {
        jdbc.update("UPDATE operacion_venta SET estado=?, solicitud=? WHERE venta_id=?", estado, solicitud, venta);
    }
}
