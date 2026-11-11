package com.ticketuki.ventaservice.pago.service;

import com.ticketuki.ventaservice.pago.dto.EstadoResumenDTO;
import com.ticketuki.ventaservice.pago.dto.PagoRequestDTO;
import com.ticketuki.ventaservice.pago.dto.PagoResponseDTO;
import com.ticketuki.ventaservice.pago.dto.TicketResumenDTO;
import com.ticketuki.ventaservice.pago.exception.PagoNotFoundException;
import com.ticketuki.ventaservice.pago.model.EstadoPago;
import com.ticketuki.ventaservice.pago.model.Pago;
import com.ticketuki.ventaservice.pago.repository.PagoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
@Slf4j
@Service
public class PagoService {

    private final PagoRepository pagoRepository;
    private final com.ticketuki.ventaservice.repository.VentaRepository ventaRepository;
    private final com.ticketuki.ventaservice.repository.DetalleVentaRepository detalles;
    private final WebClient usuarioWebClient;
    private final WebClient ticketWebClient;

    public PagoService(PagoRepository pagoRepository,
                       com.ticketuki.ventaservice.repository.VentaRepository ventaRepository,
                       com.ticketuki.ventaservice.repository.DetalleVentaRepository detalles,
                       @Qualifier("usuarioWebClient") WebClient usuarioWebClient,
                       @Qualifier("ticketWebClient") WebClient ticketWebClient) {
        this.pagoRepository = pagoRepository;
        this.ventaRepository = ventaRepository;
        this.detalles = detalles;
        this.usuarioWebClient = usuarioWebClient;
        this.ticketWebClient = ticketWebClient;
    }

    // Busca el ID de un estado de ticket por nombre exacto (ej. "CANCELADO")
    private Long obtenerIdEstadoTicket(String fragmento) {
        try {
            List<EstadoResumenDTO> estados = ticketWebClient.get()
                    .uri("/estadosTicket")
                    .retrieve()
                    .bodyToFlux(EstadoResumenDTO.class)
                    .collectList()
                    .block();
            if (estados == null) throw new IllegalStateException("Catalogo no disponible");
            return estados.stream()
                    .filter(e -> e.getNombre() != null && e.getNombre().toUpperCase().equals(fragmento.toUpperCase()))
                    .map(EstadoResumenDTO::getId)
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("Estado no disponible: " + fragmento));
        } catch (Exception e) {
            log.warn("No se pudo obtener estado de ticket '{}': {}", fragmento, e.getMessage());
            throw new IllegalStateException("No se pudo consultar estados", e);
        }
    }

    private Long obtenerIdEstadoVenta(String nombre) {
        return com.ticketuki.ventaservice.model.EstadoVenta.valueOf(nombre).getId();
    }

    private PagoResponseDTO toResponseDTO(Pago p) {
        return new PagoResponseDTO(p.getId_pago(), p.getMonto(), p.getMedio_pago(),
                p.getCod_autorizacion(), p.getTimestamp(), p.getEstado(),
                p.getVenta_id(), p.getUsuario_id());
    }

    private com.ticketuki.ventaservice.model.Venta obtenerVenta(Long id) {
        return ventaRepository.findForUpdate(id)
                .orElseThrow(() -> new IllegalArgumentException("Venta no encontrada con id: " + id));
    }

    private void validarUsuarioExiste(Long usuarioId) {
        try {
            usuarioWebClient.get()
                    .uri("/usuarios/{id}", usuarioId)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError,
                            response -> Mono.error(new IllegalArgumentException("Usuario no encontrado con id: " + usuarioId)))
                    .bodyToMono(Void.class)
                    .block();
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo validar el usuario", e);
        }
    }

    private void cancelarTicketsDeLaVenta(Long ventaId) {
        Long idEstadoTicketCancelado = obtenerIdEstadoTicket("CANCELADO");
        if (idEstadoTicketCancelado == null) {
            log.warn("No se encontró estado 'CANCELADO' para tickets, se omite la cancelación");
            return;
        }
        try {
            List<TicketResumenDTO> tickets = ticketWebClient.get()
                    .uri("/tickets/venta/{ventaId}", ventaId)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<TicketResumenDTO>>() {})
                    .block();

            if (tickets == null) throw new IllegalStateException("Respuesta de tickets vacia");
            if (tickets.isEmpty()) {
                log.warn("No se encontraron tickets para la venta {}", ventaId);
                return;
            }

            Long valido = obtenerIdEstadoTicket("VALIDO");
            Long transferido = obtenerIdEstadoTicket("TRANSFERIDO");
            if (tickets.stream().anyMatch(t -> !java.util.Objects.equals(t.getEstado_ticket_id_estado(), valido)
                    && !java.util.Objects.equals(t.getEstado_ticket_id_estado(), transferido)
                    && !java.util.Objects.equals(t.getEstado_ticket_id_estado(), idEstadoTicketCancelado)))
                throw new IllegalStateException("La venta contiene tickets que no se pueden cancelar");
            for (TicketResumenDTO ticket : tickets) {
                if (java.util.Objects.equals(ticket.getEstado_ticket_id_estado(), idEstadoTicketCancelado)) continue;
                try {
                    ticketWebClient.put()
                            .uri("/tickets/{id}/estado/{idEstado}", ticket.getId_ticket(), idEstadoTicketCancelado)
                            .retrieve()
                            .bodyToMono(Void.class)
                            .block();
                    log.info("Ticket {} cancelado", ticket.getId_ticket());
                } catch (Exception e) {
                    throw new IllegalStateException("No se pudo cancelar el ticket " + ticket.getId_ticket(), e);
                }
            }
        } catch (Exception e) {
            throw new IllegalStateException("No se pudieron cancelar los tickets de la venta", e);
        }
    }

    private void actualizarVenta(Long ventaId, String estado) {
        var venta = obtenerVenta(ventaId);
        String esperado = estado.equals("REEMBOLSADA") ? "CONFIRMADA" : "PENDIENTE";
        if (!java.util.Objects.equals(venta.getEstado_venta_id_estado(), obtenerIdEstadoVenta(esperado)))
            throw new IllegalStateException("Estado de venta incompatible con la operacion de pago");
        venta.setEstado_venta_id_estado(obtenerIdEstadoVenta(estado));
        ventaRepository.save(venta);
    }

    @Transactional
    public PagoResponseDTO procesarPago(PagoRequestDTO dto) {
        log.info("Procesando pago para venta: {}", dto.getVenta_id());
        var venta = obtenerVenta(dto.getVenta_id());
        if (!java.util.Objects.equals(venta.getMonto_total(), dto.getMonto()))
            throw new IllegalArgumentException("El monto debe coincidir con el total de la venta");
        if (!java.util.Objects.equals(venta.getEstado_venta_id_estado(), obtenerIdEstadoVenta("PENDIENTE")))
            throw new IllegalStateException("La venta debe estar PENDIENTE");
        if (pagoRepository.findByVenta_id(dto.getVenta_id()).stream()
                .anyMatch(p -> p.getEstado() == EstadoPago.PENDIENTE || p.getEstado() == EstadoPago.COMPLETADO))
            throw new IllegalStateException("La venta ya tiene un pago activo");
        var lineas = detalles.findByVenta_id_venta(dto.getVenta_id());
        if (lineas.isEmpty() || lineas.stream().anyMatch(d -> !java.util.Objects.equals(d.getUsuario_id_usuario(), dto.getUsuario_id())))
            throw new IllegalArgumentException("El pago debe pertenecer al comprador de la venta");
        validarUsuarioExiste(dto.getUsuario_id());
        Pago p = new Pago(null, venta.getMonto_total(), dto.getMedio_pago(), dto.getCod_autorizacion(),
                LocalDateTime.now(), EstadoPago.PENDIENTE, dto.getVenta_id(), dto.getUsuario_id());
        return toResponseDTO(pagoRepository.save(p));
    }

    @Transactional(readOnly = true)
    public PagoResponseDTO obtenerPago(Long id) {
        return pagoRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new PagoNotFoundException("Pago no encontrado con id: " + id));
    }

    @Transactional(readOnly = true)
    public List<PagoResponseDTO> listarPorVenta(Long idVenta) {
        return pagoRepository.findByVenta_id(idVenta).stream().map(this::toResponseDTO).toList();
    }

    @Transactional
    public PagoResponseDTO completarPago(Long id) {
        Pago p = pagoRepository.findForUpdate(id)
                .orElseThrow(() -> new PagoNotFoundException("Pago no encontrado con id: " + id));
        if (p.getEstado() != EstadoPago.PENDIENTE) {
            throw new IllegalStateException(
                    "Solo se puede completar un pago en estado PENDIENTE. Estado actual: " + p.getEstado());
        }
        actualizarVenta(p.getVenta_id(), "CONFIRMADA");
        p.setEstado(EstadoPago.COMPLETADO);
        return toResponseDTO(pagoRepository.save(p));
    }

    @Transactional
    protected Pago marcarPagoReembolsado(Long id) {
        Pago p = pagoRepository.findForUpdate(id)
                .orElseThrow(() -> new PagoNotFoundException("Pago no encontrado con id: " + id));
        if (p.getEstado() != EstadoPago.COMPLETADO) {
            throw new IllegalStateException(
                    "Solo se puede reembolsar un pago en estado COMPLETADO. Estado actual: " + p.getEstado());
        }
        p.setEstado(EstadoPago.REEMBOLSADO);
        return pagoRepository.save(p);
    }

    @Transactional
    public PagoResponseDTO procesarReembolso(Long id) {
        Pago saved = marcarPagoReembolsado(id);
        log.info("Reembolso aprobado para pago {}. Coordinando cancelación de tickets y venta {}",
                id, saved.getVenta_id());
        cancelarTicketsDeLaVenta(saved.getVenta_id());
        actualizarVenta(saved.getVenta_id(), "REEMBOLSADA");
        return toResponseDTO(saved);
    }

    @Transactional
    public PagoResponseDTO cancelarPago(Long id) {
        Pago p = pagoRepository.findForUpdate(id)
                .orElseThrow(() -> new PagoNotFoundException("Pago no encontrado con id: " + id));
        if (p.getEstado() != EstadoPago.PENDIENTE) {
            throw new IllegalStateException(
                    "Solo se puede cancelar un pago en estado PENDIENTE. Estado actual: " + p.getEstado());
        }
        cancelarTicketsDeLaVenta(p.getVenta_id());
        actualizarVenta(p.getVenta_id(), "CANCELADA");
        p.setEstado(EstadoPago.CANCELADO);
        return toResponseDTO(pagoRepository.save(p));
    }

    @Transactional(readOnly = true)
    public List<PagoResponseDTO> listarPorUsuario(Long idUsuario) {
        return pagoRepository.findByUsuario_id(idUsuario).stream().map(this::toResponseDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<PagoResponseDTO> listarPorEstado(EstadoPago estado) {
        return pagoRepository.findByEstado(estado).stream().map(this::toResponseDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<PagoResponseDTO> listarPorPeriodo(LocalDate desde, LocalDate hasta) {
        if (desde.isAfter(hasta)) {
            throw new IllegalArgumentException("La fecha 'desde' no puede ser posterior a 'hasta'");
        }
        return pagoRepository.findByTimestampBetween(
                desde.atStartOfDay(), hasta.atTime(java.time.LocalTime.MAX)
        ).stream().map(this::toResponseDTO).toList();
    }
}
