package com.ticketuki.eventoservice.service;

import com.ticketuki.eventoservice.dto.EventoRequestDTO;
import com.ticketuki.eventoservice.dto.EventoResponseDTO;
import com.ticketuki.eventoservice.exception.EventoNotFoundException;
import com.ticketuki.eventoservice.model.Evento;
import com.ticketuki.eventoservice.repository.EventoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventoService {
    private final EventoRepository eventoRepository;

    private EventoResponseDTO toResponseDTO(Evento evento) {
        return new EventoResponseDTO(
                evento.getId_evento(),
                evento.getNombre_evento(),
                evento.getAforo_evento(),
                evento.getFecha_evento(),
                evento.getDescripcion(),
                evento.getEstado_evento_id_estado(),
                evento.getRecinto_id_recinto(),
                evento.getParticipantes());
    }

    @Transactional(readOnly = true)
    public List<EventoResponseDTO> obtenerTodos() {
        log.info("Obteniendo todos los eventos");
        return eventoRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventoResponseDTO obtenerPorId(Long id) {
        log.info("Obteniendo evento por id: {}", id);
        return eventoRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new EventoNotFoundException("Evento no encontrado: " + id));
    }

    @Transactional
    public EventoResponseDTO crear(EventoRequestDTO eventoDTO) {
        log.info("Creando evento: {}", eventoDTO.getNombre_evento());
        Evento evento = new Evento(null,
                eventoDTO.getNombre_evento(),
                eventoDTO.getAforo_evento(),
                eventoDTO.getFecha_evento(),
                eventoDTO.getDescripcion(),
                eventoDTO.getEstado_evento_id_estado(),
                eventoDTO.getRecinto_id_recinto(),
                eventoDTO.getParticipantes());
        return toResponseDTO(eventoRepository.save(evento));
    }

    @Transactional
    public EventoResponseDTO actualizar(Long id, EventoRequestDTO eventoDTO) {
        log.info("Actualizando evento: {}", id);
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Evento no encontrado para actualizar: {}", id);
                    return new EventoNotFoundException("Evento no encontrado: " + id);
                });
        evento.setNombre_evento(eventoDTO.getNombre_evento());
        evento.setAforo_evento(eventoDTO.getAforo_evento());
        evento.setFecha_evento(eventoDTO.getFecha_evento());
        evento.setDescripcion(eventoDTO.getDescripcion());
        evento.setEstado_evento_id_estado(eventoDTO.getEstado_evento_id_estado());
        evento.setRecinto_id_recinto(eventoDTO.getRecinto_id_recinto());
        evento.setParticipantes(eventoDTO.getParticipantes());
        return toResponseDTO(eventoRepository.save(evento));
    }

    @Transactional
    public void eliminar(Long id) {
        log.info("Eliminando evento: {}", id);
        if (!eventoRepository.existsById(id)) {
            log.warn("Evento no encontrado para eliminar: {}", id);
            throw new EventoNotFoundException("Evento no encontrado: " + id);
        }
        eventoRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<EventoResponseDTO> obtenerPorFecha(LocalDate fecha) {
        log.info("Buscando eventos por fecha: {}", fecha);
        return eventoRepository.findByFechaEvento(fecha)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EventoResponseDTO> obtenerPorRecinto(Long recintoId) {
        log.info("Buscando eventos por recinto: {}", recintoId);
        return eventoRepository.findByRecintoIdRecinto(recintoId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional
    public EventoResponseDTO cambiarEstado(Long id, Long idEstado) {
        log.info("Cambiando estado del evento {} a {}", id, idEstado);
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Evento no encontrado para cambiar estado: {}", id);
                    return new EventoNotFoundException("Evento no encontrado: " + id);
                });
        evento.setEstado_evento_id_estado(idEstado);
        return toResponseDTO(eventoRepository.save(evento));
    }
}
