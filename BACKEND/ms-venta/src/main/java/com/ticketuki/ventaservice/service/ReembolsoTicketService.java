package com.ticketuki.ventaservice.service;

import com.ticketuki.ventaservice.client.TicketsCompraClient;
import com.ticketuki.common.security.AccesoServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReembolsoTicketService {
    private final JdbcTemplate jdbc;
    private final TicketsCompraClient tickets;
    private final AccesoServicio acceso;
    private long numero(Map<String,Object> fila, String clave) { return ((Number) fila.get(clave)).longValue(); }

    @Transactional
    public void registrar(Long id) {
        var ticket = tickets.devolucion(id);
        if (ticket == null || !Objects.equals(ticket.id_ticket(), id)) throw new IllegalArgumentException("Devolución inválida");
        Long venta = ticket.venta_id_venta();
        // Mismo orden de bloqueo que las operaciones de pago: pago y luego venta.
        jdbc.queryForList("SELECT id_pago FROM pago WHERE venta_id=? FOR UPDATE", venta);
        var orden = jdbc.queryForMap("SELECT estado,monto_total FROM venta WHERE id_venta=? FOR UPDATE", venta);
        if (!jdbc.queryForList("SELECT ticket_id FROM reembolso_ticket WHERE ticket_id=?", id).isEmpty()) return;
        // Un reembolso completo previo ya incluye esta entrada.
        if ("REEMBOLSADA".equals(orden.get("estado"))) return;
        if (!"CONFIRMADA".equals(orden.get("estado"))) throw new IllegalArgumentException("Compra no confirmada");
        var grupo = tickets.listar(venta).stream().filter(t -> numero(t,"evento_id_evento") == ticket.evento_id_evento()
                && numero(t,"sector_id_sector") == ticket.sector_id_sector()).sorted(Comparator.comparingLong(t -> numero(t,"id_ticket"))).toList();
        int posicion = -1;
        for (int i=0; i<grupo.size(); i++) if (numero(grupo.get(i),"id_ticket") == id) posicion=i;
        if (posicion < 0) throw new IllegalArgumentException("Entrada no asociada a la compra");
        var detalles = jdbc.queryForList("SELECT cantidad_ticket,precio_total,precio_iva,comision FROM detalle_venta WHERE venta_id_venta=? AND evento_id_evento=? AND sector_id_sector=? ORDER BY id_detalle", venta, ticket.evento_id_evento(), ticket.sector_id_sector());
        Map<String,Object> detalle = null;
        for (var candidato : detalles) {
            if (posicion < numero(candidato,"cantidad_ticket")) { detalle=candidato; break; }
            posicion -= (int) numero(candidato,"cantidad_ticket");
        }
        if (detalle == null) throw new IllegalArgumentException("No se encontró el importe de la entrada");
        long monto = numero(detalle,"precio_total") / numero(detalle,"cantidad_ticket");
        jdbc.update("INSERT INTO reembolso_ticket(ticket_id,venta_id,monto,iva,comision) VALUES (?,?,?,?,?)",
                id, venta, monto, numero(detalle,"precio_iva"), numero(detalle,"comision"));
        long devueltas = jdbc.queryForObject("SELECT COUNT(*) FROM reembolso_ticket WHERE venta_id=?", Long.class, venta);
        long compradas = jdbc.queryForObject("SELECT SUM(cantidad_ticket) FROM detalle_venta WHERE venta_id_venta=?", Long.class, venta);
        if (devueltas == compradas) {
            jdbc.update("UPDATE venta SET estado='REEMBOLSADA' WHERE id_venta=?", venta);
            jdbc.update("UPDATE pago SET estado='REEMBOLSADO' WHERE venta_id=? AND estado='COMPLETADO'", venta);
        }
    }

    public List<Map<String,Object>> listar() {
        acceso.administrador();
        return jdbc.queryForList("SELECT * FROM reembolso_ticket ORDER BY creado_en DESC,ticket_id DESC");
    }
}
