package com.ticketuki.ticketservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketuki.ticketservice.dto.*;
import com.ticketuki.ticketservice.repository.*;
import com.ticketuki.ticketservice.client.ReferenciasTicketClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TicketsVentaService {
    private final OperacionVentaStore operaciones;
    private final TicketService tickets;
    private final TicketRepository repository;
    private final CupoEventoRepository cupos;
    private final ReferenciasTicketClient referencias;
    private final ObjectMapper mapper;

    @Transactional
    public List<TicketResponseDTO> emitir(Long venta, List<TicketRequestDTO> solicitud) {
        var operacion = operaciones.bloquear(venta);
        String contenido;
        try { contenido = mapper.writeValueAsString(solicitud); }
        catch (Exception ex) { throw new IllegalArgumentException("Solicitud inválida", ex); }
        if ("CANCELADA".equals(operacion.estado()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La emisión de esta venta fue cancelada");
        if ("EMITIDA".equals(operacion.estado())) {
            if (!contenido.equals(operacion.solicitud()))
                throw new ResponseStatusException(HttpStatus.CONFLICT, "La venta ya se emitió con otros datos");
            return tickets.listarPorVenta(venta);
        }
        if (solicitud.isEmpty() || solicitud.stream().anyMatch(t -> !venta.equals(t.getVenta_id_venta())))
            throw new IllegalArgumentException("Los tickets deben pertenecer a la venta");
        var referencia = referencias.venta(venta);
        if (referencia.detalles() == null || referencia.estado_venta() == null
                || !"CONFIRMADA".equals(referencia.estado_venta().nombre()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La venta debe estar confirmada");
        Map<String, Long> comprados = new HashMap<>();
        referencia.detalles().forEach(d -> comprados.merge(d.evento_id_evento() + ":" + d.sector_id_sector(),
                d.cantidad_ticket().longValue(), Long::sum));
        Map<String, Long> pedidos = new HashMap<>();
        solicitud.forEach(t -> pedidos.merge(t.getEvento_id_evento() + ":" + t.getSector_id_sector(), 1L, Long::sum));
        if (!comprados.equals(pedidos)) throw new IllegalArgumentException("Los titulares no coinciden con la cantidad comprada");
        if (!repository.findByVenta_id_venta(venta).isEmpty())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta venta ya tiene tickets emitidos manualmente");
        solicitud.stream().map(TicketRequestDTO::getEvento_id_evento).distinct().sorted().forEach(evento -> {
            cupos.asegurar(evento);
            cupos.bloquear(evento).orElseThrow();
        });
        List<TicketResponseDTO> emitidos = solicitud.stream().map(tickets::crearTicket).toList();
        operaciones.guardar(venta, "EMITIDA", contenido);
        return emitidos;
    }

    @Transactional
    public void cancelar(Long venta) {
        var operacion = operaciones.bloquear(venta);
        if ("CANCELADA".equals(operacion.estado())) return;
        var existentes = repository.bloquearPorVenta(venta);
        if (existentes.stream().anyMatch(t -> t.getEstado_ticket_id_estado() == null
                || !Set.of(1L, 3L, 4L).contains(t.getEstado_ticket_id_estado())))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La venta tiene tickets usados o no cancelables");
        existentes.stream().filter(t -> !Long.valueOf(3).equals(t.getEstado_ticket_id_estado()))
                .forEach(t -> tickets.cambiarEstado(t.getId_ticket(), 3L));
        operaciones.guardar(venta, "CANCELADA", operacion.solicitud());
    }
}
