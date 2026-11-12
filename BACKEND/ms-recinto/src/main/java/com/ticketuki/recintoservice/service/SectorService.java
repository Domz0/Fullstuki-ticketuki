package com.ticketuki.recintoservice.service;

import com.ticketuki.recintoservice.dto.SectorDTO;
import com.ticketuki.recintoservice.exception.RecintoNotFoundException;
import com.ticketuki.recintoservice.exception.SectorNotFoundException;
import com.ticketuki.recintoservice.model.Sector;
import com.ticketuki.recintoservice.repository.RecintoRepository;
import com.ticketuki.recintoservice.repository.SectorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SectorService {
    private final com.ticketuki.common.validation.ValidacionDatos validacion;
    private final com.ticketuki.common.security.AccesoServicio acceso;

    private final SectorRepository sectorRepository;
    private final RecintoRepository recintoRepository;

    private SectorDTO toResponseDTO(Sector sector) {
        return new SectorDTO(sector.getId_sector(), sector.getNombre_sector(), sector.getCapacidad_sector(), sector.getPrecio_sector(), sector.getRecinto_id_recinto());
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "SECTOR", accion = "CREAR", id = "id_sector")
    public SectorDTO crearSector(SectorDTO dto) {
        validacion.validar(dto);
        acceso.administrador();
        log.info("Creando sector: {}", dto.getNombre_sector());
        validarCapacidad(dto, null);
        Sector sector = new Sector(null, dto.getNombre_sector(), dto.getCapacidad_sector(), dto.getPrecio_sector(), dto.getRecinto_id_recinto());
        return toResponseDTO(sectorRepository.save(sector));
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "SECTOR", accion = "ACTUALIZAR", id = "id_sector")
    public SectorDTO actualizarSector(Long id, SectorDTO dto) {
        validacion.validar(dto);
        acceso.administrador();
        log.info("Actualizando sector con ID: {}", id);
        Sector sector = sectorRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Sector no encontrado para actualizar: {}", id);
                    return new SectorNotFoundException("Sector no encontrado: " + id);
                });
        if (!java.util.Objects.equals(sector.getRecinto_id_recinto(), dto.getRecinto_id_recinto()))
            throw new IllegalArgumentException("No se puede cambiar el recinto de un sector existente");
        if (dto.getCapacidad_sector() < sector.getCapacidad_sector())
            throw new IllegalArgumentException("No se puede reducir la capacidad de un sector existente");
        validarCapacidad(dto, id);
        sector.setNombre_sector(dto.getNombre_sector());
        sector.setCapacidad_sector(dto.getCapacidad_sector());
        sector.setPrecio_sector(dto.getPrecio_sector());
        log.info("Sector actualizado exitosamente: {}", id);
        return toResponseDTO(sectorRepository.save(sector));
    }

    @Transactional(readOnly = true)
    public SectorDTO obtenerSector(Long id) {
        Sector sector = sectorRepository.findById(id)
                .orElseThrow(() -> new SectorNotFoundException("Sector no encontrado: " + id));
        return toResponseDTO(sector);
    }

    @Transactional(readOnly = true)
    public List<SectorDTO> listarPorRecinto(Long recintoId) {
        return sectorRepository.findByRecinto_id_recinto(recintoId).stream().map(this::toResponseDTO).toList();
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "SECTOR", accion = "ELIMINAR")
    public void eliminarSector(Long id) {
        acceso.administrador();
        log.info("Eliminando sector con ID: {}", id);
        Sector sector = sectorRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Sector no encontrado para eliminar: {}", id);
                    return new SectorNotFoundException("Sector no encontrado: " + id);
                });
        sectorRepository.delete(sector);
        log.info("Sector eliminado exitosamente: {}", id);
    }

    private void validarCapacidad(SectorDTO dto, Long excluir) {
        var recinto = recintoRepository.findForUpdate(dto.getRecinto_id_recinto())
                .orElseThrow(() -> new RecintoNotFoundException("Recinto no encontrado: " + dto.getRecinto_id_recinto()));
        long ocupada = sectorRepository.findForUpdateByRecinto(dto.getRecinto_id_recinto()).stream()
                .filter(s -> !java.util.Objects.equals(s.getId_sector(), excluir))
                .mapToLong(Sector::getCapacidad_sector).sum();
        if (dto.getCapacidad_sector() <= 0 || ocupada + dto.getCapacidad_sector() > recinto.getCapacidad_total())
            throw new IllegalArgumentException("La suma de capacidades de los sectores supera la capacidad del recinto");
    }
}
