package com.ticketuki.ventaservice.pago.service;

import com.ticketuki.ventaservice.pago.dto.PagoRequestDTO;
import com.ticketuki.ventaservice.pago.dto.PagoResponseDTO;
import com.ticketuki.ventaservice.pago.exception.PagoNotFoundException;
import com.ticketuki.ventaservice.pago.model.EstadoPago;
import com.ticketuki.ventaservice.pago.model.Pago;
import com.ticketuki.ventaservice.pago.repository.PagoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
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
    private final com.ticketuki.ventaservice.service.PagoTareas tareas;

    public PagoService(PagoRepository pagoRepository,
                       com.ticketuki.ventaservice.repository.VentaRepository ventaRepository,
                       com.ticketuki.ventaservice.repository.DetalleVentaRepository detalles,
                       @Qualifier("usuarioWebClient") WebClient usuarioWebClient,
                       com.ticketuki.ventaservice.service.PagoTareas tareas) {
        this.pagoRepository = pagoRepository;
        this.ventaRepository = ventaRepository;
        this.detalles = detalles;
        this.usuarioWebClient = usuarioWebClient;
        this.tareas = tareas;
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
                    .block(java.time.Duration.ofSeconds(5));
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo validar el usuario", e);
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
    @com.ticketuki.common.audit.Auditar(entidad = "PAGO", accion = "CREAR", id = "id_pago")
    public PagoResponseDTO procesarPago(PagoRequestDTO dto) {
        log.info("Procesando pago para venta: {}", dto.getVenta_id());
        var venta = obtenerVenta(dto.getVenta_id());
        if (!java.util.Objects.equals(venta.getMonto_total(), dto.getMonto()))
            throw new IllegalArgumentException("El monto debe coincidir con el total de la venta");
        if (!java.util.Objects.equals(venta.getMedio_pago(), dto.getMedio_pago().name()))
            throw new IllegalArgumentException("El medio de pago debe coincidir con el usado para calcular la venta");
        var existentes = pagoRepository.findByVenta_id(dto.getVenta_id());
        for (var existente : existentes) {
            if (java.util.Objects.equals(existente.getUsuario_id(), dto.getUsuario_id())
                    && java.util.Objects.equals(existente.getMonto(), dto.getMonto())
                    && existente.getMedio_pago() == dto.getMedio_pago()
                    && java.util.Objects.equals(existente.getCod_autorizacion(), dto.getCod_autorizacion()))
                return toResponseDTO(existente);
        }
        if (!java.util.Objects.equals(venta.getEstado_venta_id_estado(), obtenerIdEstadoVenta("PENDIENTE")))
            throw new IllegalStateException("La venta debe estar PENDIENTE");
        if (!existentes.isEmpty()) throw new IllegalStateException("La venta ya tiene un pago con otros datos");
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
    @com.ticketuki.common.audit.Auditar(entidad = "PAGO", accion = "ACTUALIZAR", id = "id_pago")
    public PagoResponseDTO completarPago(Long id) {
        Pago p = pagoRepository.findForUpdate(id)
                .orElseThrow(() -> new PagoNotFoundException("Pago no encontrado con id: " + id));
        if (p.getEstado() == EstadoPago.COMPLETADO) return toResponseDTO(p);
        if (tareas.cancelacionPendiente(id)) throw new IllegalStateException("La cancelación está en proceso");
        if (p.getEstado() != EstadoPago.PENDIENTE) {
            throw new IllegalStateException(
                    "Solo se puede completar un pago en estado PENDIENTE. Estado actual: " + p.getEstado());
        }
        actualizarVenta(p.getVenta_id(), "CONFIRMADA");
        p.setEstado(EstadoPago.COMPLETADO);
        if (tareas.esCompra(id)) tareas.solicitar(id, "EMITIR");
        return toResponseDTO(pagoRepository.save(p));
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "PAGO", accion = "ACTUALIZAR", id = "id_pago")
    public PagoResponseDTO procesarReembolso(Long id) {
        Pago p = pagoRepository.findForUpdate(id)
                .orElseThrow(() -> new PagoNotFoundException("Pago no encontrado con id: " + id));
        if (p.getEstado() == EstadoPago.REEMBOLSADO) return toResponseDTO(p);
        if (p.getEstado() != EstadoPago.COMPLETADO)
            throw new IllegalStateException("Solo se puede reembolsar un pago COMPLETADO");
        tareas.solicitar(id, "REEMBOLSAR");
        return toResponseDTO(p);
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "PAGO", accion = "ACTUALIZAR", id = "id_pago")
    public PagoResponseDTO cancelarPago(Long id) {
        Pago p = pagoRepository.findForUpdate(id)
                .orElseThrow(() -> new PagoNotFoundException("Pago no encontrado con id: " + id));
        if (p.getEstado() == EstadoPago.CANCELADO) return toResponseDTO(p);
        if (p.getEstado() != EstadoPago.PENDIENTE)
            throw new IllegalStateException("Solo se puede cancelar un pago PENDIENTE");
        tareas.solicitar(id, "CANCELAR");
        return toResponseDTO(p);
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "PAGO", accion = "ACTUALIZAR", id = "id_pago")
    public PagoResponseDTO finalizarCancelacion(Long id, boolean reembolso) {
        Pago p = pagoRepository.findForUpdate(id).orElseThrow();
        EstadoPago destino = reembolso ? EstadoPago.REEMBOLSADO : EstadoPago.CANCELADO;
        if (p.getEstado() == destino) return toResponseDTO(p);
        if (p.getEstado() != (reembolso ? EstadoPago.COMPLETADO : EstadoPago.PENDIENTE))
            throw new IllegalStateException("Estado de pago incompatible");
        actualizarVenta(p.getVenta_id(), reembolso ? "REEMBOLSADA" : "CANCELADA");
        p.setEstado(destino);
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
