package com.ticketuki.ticketservice.service;

import com.ticketuki.common.security.AccesoServicio;
import com.ticketuki.ticketservice.repository.TicketRepository;
import com.ticketuki.ticketservice.client.ReferenciasTicketClient;
import com.ticketuki.ticketservice.model.EstadoTicket;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DevolucionService {
    private final TicketRepository tickets;
    private final ReferenciasTicketClient referencias;
    private final AccesoServicio acceso;
    private final JdbcTemplate jdbc;

    @Transactional
    public void solicitar(Long id) {
        var ticket = tickets.findByIdForUpdate(id).orElseThrow(() -> new IllegalArgumentException("Entrada no encontrada"));
        acceso.titular(ticket.getRun_titular());
        if (!jdbc.queryForList("SELECT ticket_id FROM devolucion_pendiente WHERE ticket_id=?", id).isEmpty()) return;
        if (ticket.getEstado() == null || !Set.of(EstadoTicket.VALIDO, EstadoTicket.TRANSFERIDO).contains(ticket.getEstado()))
            throw new IllegalArgumentException("La entrada ya fue usada o cancelada");
        var evento = referencias.evento(ticket.getEvento_id_evento());
        if (evento.fecha_evento() == null || evento.fecha_evento().isBefore(LocalDate.now(ZoneId.of("America/Santiago")))
                || Long.valueOf(4).equals(evento.estado_evento_id_estado()))
            throw new IllegalArgumentException("No puedes devolver entradas de eventos concluidos");
        var venta = referencias.venta(ticket.getVenta_id_venta());
        if (venta.estado_venta() == null || !"CONFIRMADA".equals(venta.estado_venta().nombre()))
            throw new IllegalArgumentException("La compra no está confirmada");
        ticket.setEstado(EstadoTicket.CANCELADO);
        tickets.saveAndFlush(ticket);
        jdbc.update("INSERT INTO devolucion_pendiente(ticket_id) VALUES (?)", id);
    }

    public Map<String,Object> estado(Long id) {
        var ticket = tickets.findById(id).orElseThrow();
        acceso.titular(ticket.getRun_titular());
        var fila = jdbc.queryForMap("SELECT enviada_en FROM devolucion_pendiente WHERE ticket_id=?", id);
        return Map.of("estado", fila.get("enviada_en") == null ? "PENDIENTE" : "REEMBOLSADA");
    }
}
