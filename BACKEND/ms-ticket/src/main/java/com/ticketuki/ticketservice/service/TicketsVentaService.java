package com.ticketuki.ticketservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketuki.ticketservice.dto.*;
import com.ticketuki.ticketservice.repository.*;
import com.ticketuki.ticketservice.client.ReferenciasTicketClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.LocalDate;
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

    @Value("${reservas.minutos:10}")
    private int minutosReserva = 10;

    private String contenido(List<TicketRequestDTO> solicitud) {
        solicitud.forEach(t -> t.setRun_titular(t.getRun_titular()));
        try { return mapper.writeValueAsString(solicitud); }
        catch (Exception ex) { throw new IllegalArgumentException("Solicitud inválida", ex); }
    }

    private void validarVenta(Long venta, List<TicketRequestDTO> solicitud, String estado) {
        if (solicitud.isEmpty() || solicitud.stream().anyMatch(t -> !venta.equals(t.getVenta_id_venta())))
            throw new IllegalArgumentException("Los tickets deben pertenecer a la venta");
        var referencia = referencias.venta(venta);
        if (!venta.equals(referencia.id_venta()) || referencia.detalles() == null
                || referencia.estado_venta() == null || !estado.equals(referencia.estado_venta().nombre()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La venta debe estar " + estado);
        Map<String, Long> comprados = new HashMap<>();
        referencia.detalles().forEach(d -> comprados.merge(d.evento_id_evento() + ":" + d.sector_id_sector(),
                d.cantidad_ticket().longValue(), Long::sum));
        Map<String, Long> pedidos = new HashMap<>();
        Set<String> asientos = new HashSet<>();
        for (var t : solicitud) {
            String grupo = t.getEvento_id_evento() + ":" + t.getSector_id_sector();
            pedidos.merge(grupo, 1L, Long::sum);
            if (!asientos.add(grupo + ":" + t.getNum_asiento()))
                throw new IllegalArgumentException("No se puede repetir un asiento");
        }
        if (!comprados.equals(pedidos)) throw new IllegalArgumentException("Los titulares no coinciden con la cantidad comprada");
        if (!repository.findByVenta_id_venta(venta).isEmpty())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta venta ya tiene tickets emitidos manualmente");
    }

    private void bloquearEventos(List<Long> eventos) {
        eventos.stream().distinct().sorted().forEach(evento -> {
            cupos.asegurar(evento);
            cupos.bloquear(evento).orElseThrow();
        });
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public OperacionVentaStore.Reserva reservar(Long venta, List<TicketRequestDTO> solicitud) {
        var operacion = operaciones.bloquear(venta);
        String contenido = contenido(solicitud);
        if (!"ABIERTA".equals(operacion.estado())) {
            if (!contenido.equals(operacion.solicitud()))
                throw new ResponseStatusException(HttpStatus.CONFLICT, "La venta ya tiene otra solicitud");
            return operaciones.reserva(venta);
        }
        if (minutosReserva < 1 || minutosReserva > 60)
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "RESERVA_MINUTOS debe estar entre 1 y 60");
        validarVenta(venta, solicitud, "PENDIENTE");
        bloquearEventos(solicitud.stream().map(TicketRequestDTO::getEvento_id_evento).toList());
        Map<Long, Long> cantidadesEvento = new HashMap<>();
        Map<String, Long> cantidadesSector = new HashMap<>();
        solicitud.forEach(t -> {
            cantidadesEvento.merge(t.getEvento_id_evento(), 1L, Long::sum);
            cantidadesSector.merge(t.getEvento_id_evento() + ":" + t.getSector_id_sector(), 1L, Long::sum);
        });
        Map<Long, ReferenciasTicketClient.Evento> eventos = new HashMap<>();
        Map<Long, ReferenciasTicketClient.Sector> sectores = new HashMap<>();
        for (var t : solicitud) {
            var evento = eventos.computeIfAbsent(t.getEvento_id_evento(), referencias::evento);
            var sector = sectores.computeIfAbsent(t.getSector_id_sector(), referencias::sector);
            if (!Objects.equals(evento.id_evento(), t.getEvento_id_evento())
                    || !Objects.equals(sector.id_sector(), t.getSector_id_sector())
                    || evento.recinto_id_recinto() == null
                    || !Objects.equals(evento.recinto_id_recinto(), sector.recinto_id_recinto()))
                throw new IllegalArgumentException("El sector no pertenece al evento");
            if (!Long.valueOf(2).equals(evento.estado_evento_id_estado()) || evento.fecha_evento() == null
                    || evento.fecha_evento().isBefore(LocalDate.now()))
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El evento no está disponible");
            if (evento.aforo_evento() == null || sector.capacidad_sector() == null
                    || evento.aforo_evento() <= 0 || sector.capacidad_sector() <= 0
                    || t.getNum_asiento() < 1 || t.getNum_asiento() > sector.capacidad_sector())
                throw new IllegalArgumentException("Capacidad o asiento inválido");
            long ocupadosEvento = repository.contarEvento(evento.id_evento()) + operaciones.reservadosEvento(evento.id_evento());
            long ocupadosSector = repository.contarSector(evento.id_evento(), sector.id_sector())
                    + operaciones.reservadosSector(evento.id_evento(), sector.id_sector());
            if (ocupadosEvento + cantidadesEvento.get(evento.id_evento()) > evento.aforo_evento()
                    || ocupadosSector + cantidadesSector.get(evento.id_evento() + ":" + sector.id_sector()) > sector.capacidad_sector())
                throw new ResponseStatusException(HttpStatus.CONFLICT, "No quedan cupos para esta reserva");
            if (repository.existsByNum_asientoAndEvento_id_eventoAndSector_id_sector(
                    t.getNum_asiento(), evento.id_evento(), sector.id_sector())
                    || operaciones.asientoReservado(evento.id_evento(), sector.id_sector(), t.getNum_asiento()))
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El asiento ya está ocupado o reservado");
        }
        operaciones.apartar(venta, solicitud, contenido, minutosReserva);
        return operaciones.reserva(venta);
    }

    @Transactional(readOnly = true)
    public OperacionVentaStore.Reserva consultarReserva(Long venta) {
        return operaciones.reserva(venta);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public OperacionVentaStore.Reserva confirmarReserva(Long venta) {
        var operacion = operaciones.bloquear(venta);
        if ("ABIERTA".equals(operacion.estado()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La venta no tiene una reserva");
        // Comparte el bloqueo por evento con quienes adquieren los cupos que vencen.
        bloquearEventos(operaciones.eventosReservados(venta));
        return operaciones.confirmar(venta);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public List<TicketResponseDTO> emitir(Long venta, List<TicketRequestDTO> solicitud) {
        var operacion = operaciones.bloquear(venta);
        String contenido = contenido(solicitud);
        if ("EMITIDA".equals(operacion.estado())) {
            if (!contenido.equals(operacion.solicitud()))
                throw new ResponseStatusException(HttpStatus.CONFLICT, "La venta ya se emitió con otros datos");
            return tickets.listarPorVenta(venta);
        }
        if (!Set.of("ABIERTA", "CONFIRMADA").contains(operacion.estado()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La reserva no está confirmada o la venta fue cancelada");
        if ("CONFIRMADA".equals(operacion.estado()) && !contenido.equals(operacion.solicitud()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Los tickets no coinciden con la reserva");
        validarVenta(venta, solicitud, "CONFIRMADA");
        bloquearEventos(solicitud.stream().map(TicketRequestDTO::getEvento_id_evento).toList());
        operaciones.liberar(venta);
        operaciones.guardar(venta, "ABIERTA", contenido);
        List<TicketResponseDTO> emitidos = solicitud.stream().map(tickets::crearTicket).toList();
        operaciones.guardar(venta, "EMITIDA", contenido);
        return emitidos;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void cancelar(Long venta) {
        var operacion = operaciones.bloquear(venta);
        if ("CANCELADA".equals(operacion.estado())) return;
        bloquearEventos(operaciones.eventosReservados(venta));
        var existentes = repository.bloquearPorVenta(venta);
        if (existentes.stream().anyMatch(t -> t.getEstado_ticket_id_estado() == null
                || !Set.of(1L, 3L, 4L).contains(t.getEstado_ticket_id_estado())))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La venta tiene tickets usados o no cancelables");
        existentes.stream().filter(t -> !Long.valueOf(3).equals(t.getEstado_ticket_id_estado()))
                .forEach(t -> tickets.cambiarEstado(t.getId_ticket(), 3L));
        operaciones.liberar(venta);
        operaciones.guardar(venta, "CANCELADA", operacion.solicitud());
    }
}
