package com.ticketuki.ventaservice.service;

import com.ticketuki.ventaservice.model.EstadoVenta;
import com.ticketuki.ventaservice.promocion.model.Promocion;
import com.ticketuki.ventaservice.promocion.repository.PromocionRepository;
import com.ticketuki.ventaservice.dto.DetalleVentaRequestDTO;
import com.ticketuki.ventaservice.dto.DetalleVentaResponseDTO;
import com.ticketuki.ventaservice.dto.EstadoVentaDTO;
import com.ticketuki.ventaservice.dto.VentaRequestDTO;
import com.ticketuki.ventaservice.dto.VentaResponseDTO;
import com.ticketuki.ventaservice.exception.VentaNotFoundException;
import com.ticketuki.ventaservice.model.DetalleVenta;
import com.ticketuki.ventaservice.model.Venta;
import com.ticketuki.ventaservice.repository.DetalleVentaRepository;
import com.ticketuki.ventaservice.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class VentaService {
    private final com.ticketuki.common.validation.ValidacionDatos validacion;
    private final com.ticketuki.common.security.AccesoServicio acceso;

    private static final double PORCENTAJE_IVA      = 0.19;
    private static final double PORCENTAJE_COMISION = 0.10;

    private final VentaRepository ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;
    private final PromocionRepository promocionRepository;
    private final com.ticketuki.ventaservice.client.CatalogoVentaClient catalogo;


    // ── Helpers ──────────────────────────────────────────────────────────────

    private void validarPropietario(Long ventaId) {
        acceso.propietarios(detalleVentaRepository.findByVenta_id_venta(ventaId).stream()
                .map(DetalleVenta::getUsuario_id_usuario).toList());
    }

    private EstadoVentaDTO obtenerEstado(Long id) {
        EstadoVenta estado = EstadoVenta.fromId(id);
        if (estado == null) throw new IllegalArgumentException("El estado de venta es obligatorio");
        return new EstadoVentaDTO(estado.getId(), estado.name());
    }

    private Promocion obtenerPromocionActiva(Long promocionId) {
        Promocion promo = promocionRepository.findForRead(promocionId)
                .orElseThrow(() -> new IllegalArgumentException("Promoción no encontrada: " + promocionId));
        LocalDate hoy = LocalDate.now();
        if (hoy.isBefore(promo.getFecha_inicio()) || hoy.isAfter(promo.getFecha_expiracion()))
            throw new IllegalArgumentException("La promoción " + promocionId + " no está vigente");
        if (promo.getDescuento() < 1 || promo.getDescuento() > 100)
            throw new IllegalArgumentException("Descuento fuera del rango permitido");
        return promo;
    }

    private DetalleVenta calcularDetalle(DetalleVentaRequestDTO dto, Long ventaId, String medio) {
        long precioNeto = catalogo.precioPara(dto);
        long descuentoMonto = 0;
        Long promocionId = null;

        // Si viene un id de promoción, validar que exista y esté vigente, luego aplicar el descuento
        if (dto.getPromocion_id() != null) {
            Promocion promo = obtenerPromocionActiva(dto.getPromocion_id());
            if (promo != null) {
                com.ticketuki.ventaservice.promocion.model.ReglaPromocion.desde(promo.getRestriccion()).validar(medio, dto.getCantidad_ticket());
                descuentoMonto = Math.round(precioNeto * promo.getDescuento() / 100.0);
                promocionId = promo.getId_promocion();
                log.info("Promoción {} aplicada: descuento de {} sobre precio neto {}",
                        promocionId, descuentoMonto, precioNeto);
            }
        }

        // El IVA y la comisión se calculan sobre el precio ya descontado
        long precioBase  = precioNeto - descuentoMonto;
        long precioIva   = Math.round(precioBase * PORCENTAJE_IVA);
        long comision    = Math.round(precioBase * PORCENTAJE_COMISION);
        long precioTotal = (precioBase + precioIva + comision) * dto.getCantidad_ticket();

        return new DetalleVenta(null, dto.getCantidad_ticket(), precioNeto,
                precioIva, precioTotal, comision,
                dto.getUsuario_id_usuario(), ventaId, dto.getSector_id_sector(),
                promocionId, descuentoMonto, dto.getEvento_id_evento());
    }

    private DetalleVentaResponseDTO mapDetalleToDTO(DetalleVenta d) {
        return new DetalleVentaResponseDTO(d.getId_detalle(), d.getCantidad_ticket(),
                d.getPrecio_neto(), d.getPrecio_iva(), d.getPrecio_total(), d.getComision(),
                d.getUsuario_id_usuario(), d.getVenta_id_venta(), d.getSector_id_sector(),
                d.getPromocion_id(), d.getDescuento_monto(), d.getEvento_id_evento());
    }

    private VentaResponseDTO toResponseDTO(Venta v, List<DetalleVentaResponseDTO> detalles) {
        EstadoVentaDTO estado = obtenerEstado(v.getEstado_venta_id_estado());
        return new VentaResponseDTO(v.getId_venta(), v.getFecha_venta(), v.getMedio_pago(),
                v.getCod_autorizacion(), v.getMonto_total(), estado, detalles);
    }

    // ── Operaciones de venta ─────────────────────────────────────────────────

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "VENTA", accion = "CREAR", id = "id_venta")
    public VentaResponseDTO crearVenta(VentaRequestDTO dto) {
        validacion.validar(dto);
        if (dto == null || dto.getDetalles() == null || dto.getDetalles().isEmpty())
            throw new IllegalArgumentException("Debe indicar detalles de venta");
        acceso.propietarios(dto.getDetalles().stream().map(DetalleVentaRequestDTO::getUsuario_id_usuario).toList());
        log.info("Creando venta con medio de pago: {}", dto.getMedio_pago());
        try { com.ticketuki.ventaservice.pago.model.MedioPago.valueOf(dto.getMedio_pago()); }
        catch (RuntimeException ex) { throw new IllegalArgumentException("Medio de pago inválido"); }

        // 1. Validar el estado de venta
        if (dto.getEstado_venta_id_estado() != null && !EstadoVenta.PENDIENTE.getId().equals(dto.getEstado_venta_id_estado()))
            throw new IllegalArgumentException("Una venta nueva debe quedar PENDIENTE");
        EstadoVentaDTO estado = obtenerEstado(EstadoVenta.PENDIENTE.getId());
        Long comprador = dto.getDetalles().getFirst().getUsuario_id_usuario();
        if (dto.getDetalles().stream().anyMatch(d -> !java.util.Objects.equals(comprador, d.getUsuario_id_usuario())))
            throw new IllegalArgumentException("Todos los detalles deben pertenecer al mismo comprador");
        catalogo.validarUsuario(comprador);
        catalogo.validarCupos(dto.getDetalles());

        // 2. Calcular detalles en memoria (descuento, IVA 19%, comisión 10%)
        List<DetalleVenta> detallesCalculados = dto.getDetalles().stream()
                .map(d -> calcularDetalle(d, null, dto.getMedio_pago()))
                .toList();

        // 3. Calcular monto total sumando precio_total de cada detalle
        long montoTotal = detallesCalculados.stream()
                .mapToLong(DetalleVenta::getPrecio_total)
                .sum();

        // 4. Guardar la venta con el monto calculado
        Venta venta = new Venta(null, LocalDateTime.now(), dto.getMedio_pago(),
                dto.getCod_autorizacion(), montoTotal, EstadoVenta.PENDIENTE.getId(), null, null);
        Venta ventaGuardada = ventaRepository.save(venta);
        log.info("Venta creada con id: {}, monto total: {}", ventaGuardada.getId_venta(), montoTotal);

        // 5. Asociar detalles a la venta y guardarlos
        detallesCalculados.forEach(d -> d.setVenta_id_venta(ventaGuardada.getId_venta()));
        List<DetalleVenta> detallesGuardados = detalleVentaRepository.saveAll(detallesCalculados);

        // 6. Construir respuesta completa
        List<DetalleVentaResponseDTO> detallesDTO = detallesGuardados.stream()
                .map(this::mapDetalleToDTO)
                .toList();

        return new VentaResponseDTO(ventaGuardada.getId_venta(), ventaGuardada.getFecha_venta(),
                ventaGuardada.getMedio_pago(), ventaGuardada.getCod_autorizacion(),
                montoTotal, estado, detallesDTO);
    }

    @Transactional
    public VentaResponseDTO cambiarEstado(Long id, Long idEstado) {
        acceso.administrador();
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new VentaNotFoundException("Venta no encontrada: " + id));
        obtenerEstado(idEstado);
        if (!java.util.Objects.equals(venta.getEstado_venta_id_estado(), idEstado))
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "El estado de venta se modifica mediante las operaciones de pago");
        return toResponseDTO(venta, listarDetallesPorVenta(id));

    }

    @Transactional(readOnly = true)
    public VentaResponseDTO obtenerVenta(Long id) {
        validarPropietario(id);
        Venta v = ventaRepository.findById(id)
                .orElseThrow(() -> new VentaNotFoundException("Venta no encontrada: " + id));
        List<DetalleVentaResponseDTO> detalles = detalleVentaRepository
                .findByVenta_id_venta(v.getId_venta()).stream()
                .map(this::mapDetalleToDTO)
                .toList();
        return toResponseDTO(v, detalles);
    }

    @Transactional(readOnly = true)
    public List<VentaResponseDTO> listarVentas() {
        acceso.administrador();
        return ventaRepository.findAll().stream()
                .map(v -> {
                    List<DetalleVentaResponseDTO> detalles = detalleVentaRepository
                            .findByVenta_id_venta(v.getId_venta()).stream()
                            .map(this::mapDetalleToDTO)
                            .toList();
                    return toResponseDTO(v, detalles);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VentaResponseDTO> listarPorPeriodo(LocalDateTime inicio, LocalDateTime fin) {
        acceso.administrador();
        return ventaRepository.findByFecha_ventaBetween(inicio, fin).stream()
                .map(v -> {
                    List<DetalleVentaResponseDTO> detalles = detalleVentaRepository
                            .findByVenta_id_venta(v.getId_venta()).stream()
                            .map(this::mapDetalleToDTO)
                            .toList();
                    return toResponseDTO(v, detalles);
                })
                .toList();
    }

    // ── Operaciones de detalle ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public DetalleVentaResponseDTO obtenerDetalle(Long id) {
        return detalleVentaRepository.findById(id)
                .map(d -> { acceso.propietario(d.getUsuario_id_usuario()); return mapDetalleToDTO(d); })
                .orElseThrow(() -> new VentaNotFoundException("Detalle de venta no encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<DetalleVentaResponseDTO> listarDetallesPorVenta(Long ventaId) {
        validarPropietario(ventaId);
        return detalleVentaRepository.findByVenta_id_venta(ventaId).stream()
                .map(this::mapDetalleToDTO)
                .toList();
    }
}
