package com.ticketuki.ventaservice.promocion.service;

import com.ticketuki.ventaservice.promocion.dto.PromocionRequestDTO;
import com.ticketuki.ventaservice.promocion.dto.PromocionResponseDTO;
import com.ticketuki.ventaservice.promocion.model.Promocion;
import com.ticketuki.ventaservice.promocion.exception.PromocionNotFoundException;
import com.ticketuki.ventaservice.promocion.repository.PromocionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PromocionService {

    private final PromocionRepository promocionRepository;

    private PromocionResponseDTO toResponseDTO(Promocion p) {
        return new PromocionResponseDTO(
                p.getId_promocion(),
                p.getEmpresa(),
                p.getDescuento(),
                p.getDescripcion(),
                p.getRestriccion(),
                p.getFecha_expiracion(),
                p.getFecha_inicio(),
                p.getCreated_at(),
                p.getUpdated_at()
        );
    }

    private void validarFechas(LocalDate fechaInicio, LocalDate fechaExpiracion) {
        if (fechaInicio.isAfter(fechaExpiracion)) {
            throw new IllegalArgumentException("La fecha de inicio no puede ser posterior a la fecha de expiración");
        }
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "PROMOCION", accion = "CREAR", id = "id_promocion")
    public PromocionResponseDTO crearPromocion(PromocionRequestDTO dto) {
        log.info("Creando promoción de empresa: {}", dto.getEmpresa());
        validarFechas(dto.getFecha_inicio(), dto.getFecha_expiracion());
        Promocion p = Promocion.builder()
                .empresa(dto.getEmpresa())
                .descuento(dto.getDescuento())
                .descripcion(dto.getDescripcion())
                .restriccion(dto.getRestriccion())
                .fecha_expiracion(dto.getFecha_expiracion())
                .fecha_inicio(dto.getFecha_inicio())
                .build();
        return toResponseDTO(promocionRepository.save(p));
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "PROMOCION", accion = "ACTUALIZAR", id = "id_promocion")
    public PromocionResponseDTO actualizarPromocion(Long id, PromocionRequestDTO dto) {
        log.info("Actualizando promoción con id: {}", id);
        validarFechas(dto.getFecha_inicio(), dto.getFecha_expiracion());
        Promocion p = promocionRepository.findById(id)
                .orElseThrow(() -> new PromocionNotFoundException("Promoción no encontrada: " + id));
        p.setEmpresa(dto.getEmpresa());
        p.setDescuento(dto.getDescuento());
        p.setDescripcion(dto.getDescripcion());
        p.setRestriccion(dto.getRestriccion());
        p.setFecha_expiracion(dto.getFecha_expiracion());
        p.setFecha_inicio(dto.getFecha_inicio());
        return toResponseDTO(promocionRepository.save(p));
    }

    @Transactional(readOnly = true)
    public PromocionResponseDTO obtenerPromocion(Long id) {
        return promocionRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new PromocionNotFoundException("Promoción no encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public List<PromocionResponseDTO> listarPromociones() {
        return promocionRepository.findAll().stream().map(this::toResponseDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<PromocionResponseDTO> listarActivas() {
        return promocionRepository.findPromocionesActivas(LocalDate.now()).stream().map(this::toResponseDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<PromocionResponseDTO> listarPorEmpresa(String empresa) {
        return promocionRepository.findByEmpresaIgnoreCase(empresa).stream().map(this::toResponseDTO).toList();
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "PROMOCION", accion = "ELIMINAR")
    public void eliminarPromocion(Long id) {
        if (!promocionRepository.existsById(id)) {
            throw new PromocionNotFoundException("Promoción no encontrada: " + id);
        }
        log.info("Eliminando promoción con id: {}", id);
        promocionRepository.deleteById(id);
    }
}
