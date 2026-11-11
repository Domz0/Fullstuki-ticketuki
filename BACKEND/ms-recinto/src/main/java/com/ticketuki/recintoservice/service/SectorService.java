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

    private final SectorRepository sectorRepository;
    private final RecintoRepository recintoRepository;

    private SectorDTO toResponseDTO(Sector sector) {
        return new SectorDTO(sector.getId_sector(), sector.getNombre_sector(), sector.getCapacidad_sector(), sector.getPrecio_sector(), sector.getRecinto_id_recinto());
    }

    @Transactional
    public SectorDTO crearSector(SectorDTO dto) {
        log.info("Creando sector: {}", dto.getNombre_sector());
        if (!recintoRepository.existsById(dto.getRecinto_id_recinto())) {
            log.warn("Recinto no encontrado al crear sector: {}", dto.getRecinto_id_recinto());
            throw new RecintoNotFoundException("Recinto no encontrado: " + dto.getRecinto_id_recinto());
        }
        Sector sector = new Sector(null, dto.getNombre_sector(), dto.getCapacidad_sector(), dto.getPrecio_sector(), dto.getRecinto_id_recinto());
        return toResponseDTO(sectorRepository.save(sector));
    }

    @Transactional
    public SectorDTO actualizarSector(Long id, SectorDTO dto) {
        log.info("Actualizando sector con ID: {}", id);
        Sector sector = sectorRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Sector no encontrado para actualizar: {}", id);
                    return new SectorNotFoundException("Sector no encontrado: " + id);
                });
        if (!java.util.Objects.equals(sector.getRecinto_id_recinto(), dto.getRecinto_id_recinto()))
            throw new IllegalArgumentException("No se puede cambiar el recinto de un sector existente");
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
    public void eliminarSector(Long id) {
        log.info("Eliminando sector con ID: {}", id);
        Sector sector = sectorRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Sector no encontrado para eliminar: {}", id);
                    return new SectorNotFoundException("Sector no encontrado: " + id);
                });
        sectorRepository.delete(sector);
        log.info("Sector eliminado exitosamente: {}", id);
    }
}
