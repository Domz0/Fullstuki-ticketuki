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
    private final com.ticketuki.common.validation.ValidacionDatos validacion;
    private final com.ticketuki.common.security.AccesoServicio acceso;
    private final EventoRepository eventoRepository;
    private final SectoresEventoService sectores;
    private final com.ticketuki.eventoservice.client.RecintoEventoClient recintos;

    private EventoResponseDTO toResponseDTO(Evento evento) {
        var configurados = sectores.listar(evento.getId_evento());
        var respuesta = new EventoResponseDTO(
                evento.getId_evento(),
                evento.getNombre_evento(),
                configurados.stream().mapToInt(SectoresEventoService.Sector::capacidad_sector).reduce(0, Math::addExact),
                evento.getFecha_evento(),
                evento.getDescripcion(),
                evento.getEstado_evento_id_estado(),
                evento.getRecinto_id_recinto(),
                evento.getParticipantes());
        respuesta.setCategoria(evento.getCategoria());
        respuesta.setSubcategoria(evento.getSubcategoria());
        respuesta.setCiudad(evento.getCiudad());
        respuesta.setRecinto_catalogo(evento.getRecinto_catalogo());
        respuesta.setPrecio_desde(configurados.stream().filter(s -> s.capacidad_sector() > 0)
                .map(SectoresEventoService.Sector::precio_sector).min(Integer::compareTo).orElse(null));
        respuesta.setHorario(evento.getHorario());
        respuesta.setFecha_visible(evento.getFecha_visible());
        respuesta.setDisponibilidad(null); // Los cupos actuales se consultan en ms-ticket.
        respuesta.setPlazo(evento.getPlazo());
        return respuesta;
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
    @com.ticketuki.common.audit.Auditar(entidad = "EVENTO", accion = "CREAR", id = "id_evento")
    public EventoResponseDTO crear(EventoRequestDTO eventoDTO) {
        validacion.validar(eventoDTO);
        acceso.administrador();
        log.info("Creando evento: {}", eventoDTO.getNombre_evento());
        var configuracion = sectores.preparar(eventoDTO.getRecinto_id_recinto(), eventoDTO.getSectores());
        eventoDTO.setAforo_evento(configuracion.stream().mapToInt(SectoresEventoService.Sector::capacidad_sector).sum());
        Evento evento = new Evento(null,
                eventoDTO.getNombre_evento(),
                eventoDTO.getAforo_evento(),
                eventoDTO.getFecha_evento(),
                eventoDTO.getDescripcion(),
                eventoDTO.getEstado_evento_id_estado(),
                eventoDTO.getRecinto_id_recinto(),
                eventoDTO.getParticipantes());
        evento = eventoRepository.saveAndFlush(evento);
        sectores.crear(evento.getId_evento(), configuracion);
        return toResponseDTO(evento);
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "EVENTO", accion = "ACTUALIZAR", id = "id_evento")
    public EventoResponseDTO actualizar(Long id, EventoRequestDTO eventoDTO) {
        validacion.validar(eventoDTO);
        acceso.administrador();
        log.info("Actualizando evento: {}", id);
        Evento evento = eventoRepository.findForUpdate(id)
                .orElseThrow(() -> {
                    log.warn("Evento no encontrado para actualizar: {}", id);
                    return new EventoNotFoundException("Evento no encontrado: " + id);
                });
        if (eventoDTO.getSectores() != null)
            throw new IllegalArgumentException("Los sectores se configuran al crear el evento; no se pueden cambiar con ventas o reservas existentes");
        if (evento.getRecinto_id_recinto() != null && !java.util.Objects.equals(evento.getRecinto_id_recinto(), eventoDTO.getRecinto_id_recinto()))
            throw new IllegalArgumentException("No se puede cambiar el recinto de un evento existente");
        recintos.validar(eventoDTO.getRecinto_id_recinto(), sectores.capacidadTotal(id));
        evento.setNombre_evento(eventoDTO.getNombre_evento());
        evento.setAforo_evento(sectores.capacidadTotal(id));
        evento.setFecha_evento(eventoDTO.getFecha_evento());
        evento.setDescripcion(eventoDTO.getDescripcion());
        evento.setEstado_evento_id_estado(eventoDTO.getEstado_evento_id_estado());
        evento.setRecinto_id_recinto(eventoDTO.getRecinto_id_recinto());
        evento.setParticipantes(eventoDTO.getParticipantes());
        return toResponseDTO(eventoRepository.save(evento));
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "EVENTO", accion = "ELIMINAR")
    public void eliminar(Long id) {
        acceso.administrador();
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
    @com.ticketuki.common.audit.Auditar(entidad = "EVENTO", accion = "ACTUALIZAR", id = "id_evento")
    public EventoResponseDTO cambiarEstado(Long id, Long idEstado) {
        acceso.administrador();
        log.info("Cambiando estado del evento {} a {}", id, idEstado);
        Evento evento = eventoRepository.findForUpdate(id)
                .orElseThrow(() -> {
                    log.warn("Evento no encontrado para cambiar estado: {}", id);
                    return new EventoNotFoundException("Evento no encontrado: " + id);
                });
        evento.setEstado_evento_id_estado(idEstado);
        return toResponseDTO(eventoRepository.save(evento));
    }
}
