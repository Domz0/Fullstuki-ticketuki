package com.ticketuki.historialservice.service;

import com.ticketuki.historialservice.dto.HistorialRequestDTO;
import com.ticketuki.historialservice.dto.HistorialResponseDTO;
import com.ticketuki.historialservice.exception.HistorialNotFoundException;
import com.ticketuki.historialservice.model.Historial;
import com.ticketuki.historialservice.model.TipoEntidad;
import com.ticketuki.historialservice.repository.HistorialRepository;
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
public class HistorialService {

    private final HistorialRepository historialRepository;

    private HistorialResponseDTO toResponseDTO(Historial h) {
        return new HistorialResponseDTO(h.getId_historial(), h.getEntidad(), h.getId_entidad(), h.getAccion(),
                h.getUsuario_id(), h.getTimestamp(), h.getCambios_anteriores(), h.getCambios_nuevos(), h.getEventoId(), h.getOrigen(), h.getAuthId());
    }

    @Transactional
    public HistorialResponseDTO registrar(HistorialRequestDTO dto) {
        log.info("Registrando acción: {} en entidad: {} id: {}", dto.getAccion(), dto.getEntidad(), dto.getId_entidad());
        Historial h = new Historial(null, null, null, null, dto.getEntidad(), dto.getId_entidad(), dto.getAccion(),
                dto.getUsuario_id(), LocalDateTime.now(), dto.getCambios_anteriores(), dto.getCambios_nuevos());
        return toResponseDTO(historialRepository.save(h));
    }

    @Transactional(readOnly = true)
    public HistorialResponseDTO obtenerHistorial(Long id) {
        log.info("Consultando historial id: {}", id);
        return historialRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new HistorialNotFoundException("Historial no encontrado con id: " + id));
    }

    @Transactional(readOnly = true)
    public List<HistorialResponseDTO> listarHistorial() {
        log.info("Listando todo el historial");
        return historialRepository.findAll().stream().map(this::toResponseDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<HistorialResponseDTO> obtenerPorEntidad(TipoEntidad entidad, Long idEntidad) {
        log.info("Consultando historial para entidad: {} id: {}", entidad, idEntidad);
        return historialRepository.findByEntidadAndId_entidad(entidad, idEntidad).stream()
                .map(this::toResponseDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<HistorialResponseDTO> obtenerPorUsuario(Long usuarioId) {
        log.info("Consultando historial del usuario id: {}", usuarioId);
        return historialRepository.findByUsuario_id(usuarioId).stream().map(this::toResponseDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<HistorialResponseDTO> obtenerPorPeriodo(LocalDate inicio, LocalDate fin) {
        if (inicio.isAfter(fin)) {
            throw new IllegalArgumentException("La fecha de inicio no puede ser posterior a la fecha de fin");
        }
        log.info("Consultando historial del período: {} al {}", inicio, fin);
        return historialRepository.findByTimestampBetween(inicio.atStartOfDay(), fin.atTime(23, 59, 59))
                .stream().map(this::toResponseDTO).toList();
    }
}
