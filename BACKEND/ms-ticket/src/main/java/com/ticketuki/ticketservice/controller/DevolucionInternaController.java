package com.ticketuki.ticketservice.controller;

import com.ticketuki.common.security.ClaveInterna;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
public class DevolucionInternaController {
    private final JdbcTemplate jdbc;
    private final String clave;
    public DevolucionInternaController(JdbcTemplate jdbc, @Value("${internal.service-key:${INTERNAL_SERVICE_KEY:}}") String clave) {
        this.jdbc = jdbc; this.clave = clave;
    }
    @GetMapping("/interno/devoluciones/{id}")
    public Map<String,Object> obtener(@PathVariable Long id, @RequestHeader(value="X-Internal-Key",required=false) String key) {
        ClaveInterna.validar(clave, key);
        var filas = jdbc.queryForList("SELECT t.id_ticket,t.venta_id_venta,t.evento_id_evento,t.sector_id_sector FROM ticket t JOIN devolucion_pendiente d ON d.ticket_id=t.id_ticket WHERE t.id_ticket=? AND t.estado='CANCELADO'", id);
        if (filas.isEmpty()) throw new IllegalArgumentException("La entrada no tiene una devolución registrada");
        return filas.getFirst();
    }
}
