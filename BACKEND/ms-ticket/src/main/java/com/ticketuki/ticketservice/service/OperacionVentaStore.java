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
    public record Reserva(String estado, java.time.LocalDateTime vence_en) {}

    public Reserva reserva(Long venta) {
        var filas = jdbc.query("""
                SELECT CASE WHEN estado='RESERVADA' AND reserva_hasta<=CURRENT_TIMESTAMP(6)
                       THEN 'VENCIDA' ELSE estado END AS estado, reserva_hasta
                FROM operacion_venta WHERE venta_id=?
                """, (rs,n) -> new Reserva(rs.getString(1),
                    rs.getTimestamp(2) == null ? null : rs.getTimestamp(2).toLocalDateTime()), venta);
        if (filas.isEmpty()) throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, "Reserva no encontrada");
        return filas.getFirst();
    }

    private static final String VIGENTES = """
            FROM reserva_asiento r JOIN operacion_venta o ON o.venta_id=r.venta_id
            WHERE (o.estado='CONFIRMADA' OR (o.estado='RESERVADA' AND o.reserva_hasta>CURRENT_TIMESTAMP(6)))
            """;

    public long reservadosEvento(Long evento) {
        return jdbc.queryForObject("SELECT COUNT(*) " + VIGENTES + " AND r.evento_id=?", Long.class, evento);
    }

    public long reservadosSector(Long evento, Long sector) {
        return jdbc.queryForObject("SELECT COUNT(*) " + VIGENTES + " AND r.evento_id=? AND r.sector_id=?",
                Long.class, evento, sector);
    }

    public boolean asientoReservado(Long evento, Long sector, Integer asiento) {
        return jdbc.queryForObject("SELECT COUNT(*) " + VIGENTES
                + " AND r.evento_id=? AND r.sector_id=? AND r.num_asiento=?",
                Long.class, evento, sector, asiento) > 0;
    }

    public void apartar(Long venta, java.util.List<com.ticketuki.ticketservice.dto.TicketRequestDTO> tickets,
                        String solicitud, int minutos) {
        for (var ticket : tickets)
            jdbc.update("INSERT INTO reserva_asiento(venta_id,evento_id,sector_id,num_asiento) VALUES (?,?,?,?)",
                    venta, ticket.getEvento_id_evento(), ticket.getSector_id_sector(), ticket.getNum_asiento());
        jdbc.update("""
                UPDATE operacion_venta SET estado='RESERVADA', solicitud=?,
                reserva_hasta=TIMESTAMPADD(MINUTE, ?, CURRENT_TIMESTAMP(6)) WHERE venta_id=?
                """, solicitud, minutos, venta);
    }

    public Reserva confirmar(Long venta) {
        jdbc.update("""
                UPDATE operacion_venta SET estado='CONFIRMADA'
                WHERE venta_id=? AND estado='RESERVADA' AND reserva_hasta>CURRENT_TIMESTAMP(6)
                """, venta);
        return reserva(venta);
    }

    public java.util.List<Long> eventosReservados(Long venta) {
        return jdbc.queryForList("SELECT DISTINCT evento_id FROM reserva_asiento WHERE venta_id=? ORDER BY evento_id",
                Long.class, venta);
    }

    public void liberar(Long venta) {
        jdbc.update("DELETE FROM reserva_asiento WHERE venta_id=?", venta);
    }
}
