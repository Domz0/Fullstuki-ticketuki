package com.ticketuki.recintoservice.service;

import com.ticketuki.recintoservice.dto.DireccionRecintoDTO;
import com.ticketuki.recintoservice.dto.RecintoDTO;
import com.ticketuki.recintoservice.exception.RecintoNotFoundException;
import com.ticketuki.recintoservice.model.DireccionRecinto;
import com.ticketuki.recintoservice.model.Recinto;
import com.ticketuki.recintoservice.repository.RecintoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecintoService {
    private final com.ticketuki.common.validation.ValidacionDatos validacion;
    private final com.ticketuki.common.security.AccesoServicio acceso;

    private final RecintoRepository recintoRepository;

    private DireccionRecintoDTO direccionToDTO(DireccionRecinto d) {
        return new DireccionRecintoDTO(
                d.getId_direccion_recinto(),
                d.getCalle(),
                d.getRegion(),
                d.getComuna(),
                d.getNum_calle(),
                d.getReferencia_acceso());
    }

    private DireccionRecinto direccionFromDTO(DireccionRecintoDTO dto) {
        return new DireccionRecinto(
                null,
                dto.getCalle(),
                dto.getRegion(),
                dto.getComuna(),
                dto.getNum_calle(),
                dto.getReferencia_acceso());
    }

    private RecintoDTO toResponseDTO(Recinto recinto) {
        DireccionRecintoDTO dir = recinto.getDireccion() != null ? direccionToDTO(recinto.getDireccion()) : null;
        return new RecintoDTO(recinto.getId_recinto(), recinto.getNombre_recinto(), recinto.getCapacidad_total(), dir);
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "RECINTO", accion = "CREAR", id = "id_recinto")
    public RecintoDTO crearRecinto(RecintoDTO dto) {
        validacion.validar(dto);
        acceso.administrador();
        log.info("Creando recinto: {}", dto.getNombre_recinto());
        DireccionRecinto dir = direccionFromDTO(dto.getDireccion());
        Recinto recinto = new Recinto(null, dto.getNombre_recinto(), dto.getCapacidad_total(), dir);
        return toResponseDTO(recintoRepository.save(recinto));
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "RECINTO", accion = "ACTUALIZAR", id = "id_recinto")
    public RecintoDTO actualizarRecinto(Long id, RecintoDTO dto) {
        validacion.validar(dto);
        acceso.administrador();
        log.info("Actualizando recinto con ID: {}", id);
        Recinto recinto = recintoRepository.findForUpdate(id)
                .orElseThrow(() -> {
                    log.warn("Recinto no encontrado para actualizar: {}", id);
                    return new RecintoNotFoundException("Recinto no encontrado: " + id);
                });

        if (dto.getCapacidad_total() < recinto.getCapacidad_total())
            throw new IllegalArgumentException("No se puede reducir la capacidad de un recinto existente");
        recinto.setNombre_recinto(dto.getNombre_recinto());
        recinto.setCapacidad_total(dto.getCapacidad_total());

        if (recinto.getDireccion() == null) recinto.setDireccion(direccionFromDTO(dto.getDireccion()));
        if (dto.getDireccion() != null) {
            recinto.getDireccion().setCalle(dto.getDireccion().getCalle());
            recinto.getDireccion().setRegion(dto.getDireccion().getRegion());
            recinto.getDireccion().setComuna(dto.getDireccion().getComuna());
            recinto.getDireccion().setNum_calle(dto.getDireccion().getNum_calle());
            recinto.getDireccion().setReferencia_acceso(dto.getDireccion().getReferencia_acceso());
        }

        Recinto recintoActualizado = recintoRepository.save(recinto);
        log.info("Recinto actualizado exitosamente: {}", id);
        return toResponseDTO(recintoActualizado);
    }

    @Transactional(readOnly = true)
    public RecintoDTO obtenerRecinto(Long id) {
        Recinto recinto = recintoRepository.findById(id)
                .orElseThrow(() -> new RecintoNotFoundException("Recinto no encontrado: " + id));
        return toResponseDTO(recinto);
    }

    @Transactional(readOnly = true)
    public List<RecintoDTO> listarRecintos() {
        return recintoRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "RECINTO", accion = "ELIMINAR")
    public void eliminarRecinto(Long id) {
        acceso.administrador();
        log.info("Eliminando recinto con ID: {}", id);
        Recinto recinto = recintoRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Recinto no encontrado para eliminar: {}", id);
                    return new RecintoNotFoundException("Recinto no encontrado: " + id);
                });
        recintoRepository.delete(recinto);
        log.info("Recinto eliminado exitosamente: {}", id);
    }
}
