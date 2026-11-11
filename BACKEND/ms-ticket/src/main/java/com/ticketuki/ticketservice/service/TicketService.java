package com.ticketuki.ticketservice.service;

import com.ticketuki.ticketservice.dto.EstadoTicketDTO;
import com.ticketuki.ticketservice.model.EstadoTicket;
import com.ticketuki.ticketservice.dto.TicketRequestDTO;
import com.ticketuki.ticketservice.dto.TicketResponseDTO;
import com.ticketuki.ticketservice.dto.TicketUpdateDTO;
import com.ticketuki.ticketservice.dto.TransferirTicketDTO;
import com.ticketuki.ticketservice.dto.ValidarTicketResponseDTO;
import com.ticketuki.ticketservice.exception.TicketNotFoundException;
import com.ticketuki.ticketservice.exception.TicketOperacionInvalidaException;
import com.ticketuki.ticketservice.model.Ticket;
import com.ticketuki.ticketservice.repository.TicketRepository;
import com.ticketuki.ticketservice.util.QRGenerator;
import com.ticketuki.ticketservice.util.RunUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Locale;
import java.util.stream.Collectors;

@Slf4j
@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final OperacionVentaStore operaciones;
    private final com.ticketuki.ticketservice.repository.CupoEventoRepository cupos;
    private final com.ticketuki.ticketservice.client.ReferenciasTicketClient referencias;

    public TicketService(TicketRepository ticketRepository,
                         com.ticketuki.ticketservice.repository.CupoEventoRepository cupos,
                         com.ticketuki.ticketservice.client.ReferenciasTicketClient referencias, OperacionVentaStore operaciones) {
        this.operaciones = operaciones;
        this.ticketRepository = ticketRepository;
        this.cupos = cupos;
        this.referencias = referencias;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private TicketResponseDTO toResponseDTO(Ticket ticket) {
        return new TicketResponseDTO(
                ticket.getId_ticket(),
                ticket.getCod_qr(),
                ticket.getNum_asiento(),
                ticket.getNombre_titular(),
                ticket.getRun_titular(),
                ticket.getFecha_emision(),
                ticket.getVenta_id_venta(),
                ticket.getEstado_ticket_id_estado(),
                ticket.getEvento_id_evento(),
                ticket.getSector_id_sector()
        );
    }

    private String normalizar(String texto) {
        if (texto == null) return "";
        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .trim().toUpperCase(Locale.ROOT);
    }

    private List<EstadoTicketDTO> obtenerEstadosTicket() {
        return java.util.Arrays.stream(EstadoTicket.values())
                .map(e -> new EstadoTicketDTO(e.getId(), e.name())).toList();
    }

    private String obtenerNombreEstado(Long idEstado) {
        if (idEstado == null) return null;
        return obtenerEstadosTicket().stream()
                .filter(e -> e.getId().equals(idEstado))
                .map(EstadoTicketDTO::getNombre)
                .findFirst()
                .orElse(null);
    }

    private Long obtenerIdPorNombre(String fragmento) {
        String norm = normalizar(fragmento);
        return obtenerEstadosTicket().stream()
                .filter(e -> e.getNombre() != null && normalizar(e.getNombre()).equals(norm))
                .findFirst()
                .map(EstadoTicketDTO::getId)
                .orElse(null);
    }

    private Long obtenerEstadoInicial() {
        Long id = obtenerIdPorNombre("VALIDO");
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Estado VALIDO no disponible");
        }
        return id;
    }

    // ── Validaciones de estado ────────────────────────────────────────────────

    private void verificarModificable(Ticket ticket) {
        String nombre = obtenerNombreEstado(ticket.getEstado_ticket_id_estado());
        if (nombre == null) throw new TicketOperacionInvalidaException("Estado de ticket desconocido");
        String n = normalizar(nombre);
        if (!n.equals("VALIDO") && !n.equals("TRANSFERIDO")) {
            throw new TicketOperacionInvalidaException(
                    "No se puede modificar un ticket en estado '" + nombre + "'");
        }
    }

    private void verificarCambiableEstado(Ticket ticket) {
        String nombre = obtenerNombreEstado(ticket.getEstado_ticket_id_estado());
        if (nombre == null) throw new TicketOperacionInvalidaException("Estado de ticket desconocido");
        String n = normalizar(nombre);
        if (!n.equals("VALIDO") && !n.equals("TRANSFERIDO")) {
            throw new TicketOperacionInvalidaException(
                    "No se puede cambiar el estado de un ticket en estado '" + nombre + "'");
        }
    }

    private void verificarEliminable(Ticket ticket) {
        String nombre = obtenerNombreEstado(ticket.getEstado_ticket_id_estado());
        if (nombre == null) throw new TicketOperacionInvalidaException("Estado de ticket desconocido");
        if (!List.of("VALIDO", "TRANSFERIDO", "CANCELADO").contains(normalizar(nombre))) {
            throw new TicketOperacionInvalidaException(
                    "No se puede eliminar un ticket en estado '" + nombre + "'");
        }
    }

    // ── Validaciones contra microservicios ────────────────────────────────────

    private void validarEstado(Long idEstado) {
        if (EstadoTicket.fromId(idEstado) == null) {
            throw new IllegalArgumentException("El estado de ticket es obligatorio");
        }
    }

    private void validarCapacidadYCompra(TicketRequestDTO dto) {
        cupos.asegurar(dto.getEvento_id_evento());
        cupos.bloquear(dto.getEvento_id_evento()).orElseThrow();
        var evento = referencias.evento(dto.getEvento_id_evento());
        var sector = referencias.sector(dto.getSector_id_sector());
        if (!java.util.Objects.equals(evento.id_evento(), dto.getEvento_id_evento())
                || !java.util.Objects.equals(sector.id_sector(), dto.getSector_id_sector()))
            throw new IllegalArgumentException("Evento o sector de referencia inválido");
        if (evento.recinto_id_recinto() == null || !java.util.Objects.equals(evento.recinto_id_recinto(), sector.recinto_id_recinto()))
            throw new IllegalArgumentException("El sector no pertenece al recinto del evento");
        if (!Long.valueOf(2).equals(evento.estado_evento_id_estado()) || evento.fecha_evento() == null
                || evento.fecha_evento().isBefore(LocalDate.now()))
            throw new TicketOperacionInvalidaException("El evento no está disponible");
        if (evento.aforo_evento() == null || sector.capacidad_sector() == null
                || evento.aforo_evento() <= 0 || sector.capacidad_sector() <= 0)
            throw new TicketOperacionInvalidaException("Capacidad sin configurar");
        if (dto.getNum_asiento() > sector.capacidad_sector())
            throw new TicketOperacionInvalidaException("El asiento supera la capacidad del sector");
        if (ticketRepository.contarEvento(evento.id_evento()) >= evento.aforo_evento()
                || ticketRepository.contarSector(evento.id_evento(), sector.id_sector()) >= sector.capacidad_sector())
            throw new TicketOperacionInvalidaException("No quedan cupos para este evento y sector");
        if (dto.getVenta_id_venta() == null) throw new IllegalArgumentException("La venta es obligatoria");
        var venta = referencias.venta(dto.getVenta_id_venta());
        if (!java.util.Objects.equals(venta.id_venta(), dto.getVenta_id_venta()) || venta.estado_venta() == null
                || !"CONFIRMADA".equals(venta.estado_venta().nombre()) || venta.detalles() == null)
            throw new TicketOperacionInvalidaException("La venta debe estar confirmada antes de emitir tickets");
        long comprados = venta.detalles().stream()
                .filter(d -> java.util.Objects.equals(d.evento_id_evento(), evento.id_evento())
                        && java.util.Objects.equals(d.sector_id_sector(), sector.id_sector()))
                .mapToLong(d -> d.cantidad_ticket() == null ? 0 : d.cantidad_ticket()).sum();
        if (ticketRepository.contarVentaSector(venta.id_venta(), evento.id_evento(), sector.id_sector()) >= comprados)
            throw new TicketOperacionInvalidaException("No hay tickets comprados pendientes de emitir para este evento y sector");
    }

    public record Disponibilidad(long emitidos_evento, long emitidos_sector) {}

    @Transactional(readOnly = true)
    public Disponibilidad disponibilidad(Long evento, Long sector) {
        return new Disponibilidad(ticketRepository.contarEvento(evento), ticketRepository.contarSector(evento, sector));
    }

    private void validarAsientoDisponible(Integer numAsiento, Long eventoId, Long sectorId) {
        if (ticketRepository.existsByNum_asientoAndEvento_id_eventoAndSector_id_sector(
                numAsiento, eventoId, sectorId)) {
            throw new TicketOperacionInvalidaException(
                    "El asiento " + numAsiento + " ya está ocupado en este evento y sector");
        }
    }

    // ── Operaciones CRUD ──────────────────────────────────────────────────────

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "TICKET", accion = "CREAR", id = "id_ticket")
    public TicketResponseDTO crearTicket(TicketRequestDTO dto) {
        dto.setRun_titular(dto.getRun_titular());
        log.info("Creando ticket para evento: {}", dto.getEvento_id_evento());
        var operacion = operaciones.bloquear(dto.getVenta_id_venta());
        if (!"ABIERTA".equals(operacion.estado()))
            throw new TicketOperacionInvalidaException("La emisión de la venta ya está cerrada");
        validarCapacidadYCompra(dto);
        validarAsientoDisponible(dto.getNum_asiento(), dto.getEvento_id_evento(), dto.getSector_id_sector());

        Ticket ticket = new Ticket(
                null,
                QRGenerator.generarCodigoQR(),
                dto.getNum_asiento(),
                dto.getNombre_titular(),
                dto.getRun_titular(),
                LocalDate.now(),
                dto.getVenta_id_venta(),
                obtenerEstadoInicial(),
                dto.getEvento_id_evento(),
                dto.getSector_id_sector()
        );
        return toResponseDTO(ticketRepository.saveAndFlush(ticket));
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "TICKET", accion = "ACTUALIZAR", id = "id_ticket")
    public TicketResponseDTO actualizarTicket(Long id, TicketUpdateDTO dto) {
        dto.setRun_titular(dto.getRun_titular());
        Ticket ticket = ticketRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket no encontrado: " + id));
        verificarModificable(ticket);
        if (!ticket.getRun_titular().equalsIgnoreCase(dto.getRun_titular())) {
            throw new TicketOperacionInvalidaException("Use la transferencia para cambiar el RUN del titular");
        }
        ticket.setNombre_titular(dto.getNombre_titular());
        ticket.setRun_titular(dto.getRun_titular());
        return toResponseDTO(ticketRepository.save(ticket));
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "TICKET", accion = "ACTUALIZAR", id = "id_ticket")
    public TicketResponseDTO cambiarEstado(Long id, Long idEstado) {
        validarEstado(idEstado);
        Ticket ticket = ticketRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket no encontrado: " + id));
        verificarCambiableEstado(ticket);
        String destino = normalizar(obtenerNombreEstado(idEstado));
        if (!destino.equals("USADO") && !destino.equals("CANCELADO")) {
            throw new TicketOperacionInvalidaException("Solo se permite cambiar a USADO o CANCELADO por esta operación");
        }
        ticket.setEstado_ticket_id_estado(idEstado);
        return toResponseDTO(ticketRepository.save(ticket));
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "TICKET", accion = "ELIMINAR")
    public void eliminarTicket(Long id) {
        Ticket ticket = ticketRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket no encontrado: " + id));
        verificarEliminable(ticket);
        ticketRepository.deleteById(id);
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "TICKET", accion = "ACTUALIZAR", id = "ticket.id_ticket", condicion = "valido")
    public ValidarTicketResponseDTO validarTicket(String codQR) {
        Ticket ticket = ticketRepository.findByQrForUpdate(codQR)
                .orElseThrow(() -> new TicketNotFoundException("Ticket no encontrado para QR: " + codQR));
        String nombreEstado = obtenerNombreEstado(ticket.getEstado_ticket_id_estado());
        if (!List.of("VALIDO", "TRANSFERIDO").contains(normalizar(nombreEstado))) {
            return new ValidarTicketResponseDTO(false,
                    "Ticket no válido. Estado actual: " + nombreEstado,
                    toResponseDTO(ticket));
        }
        Long idUsado = obtenerIdPorNombre("USADO");
        if (idUsado == null) {
            throw new TicketOperacionInvalidaException(
                    "Estado 'USADO' no disponible");
        }
        ticket.setEstado_ticket_id_estado(idUsado);
        return new ValidarTicketResponseDTO(true, "Ticket validado correctamente",
                toResponseDTO(ticketRepository.save(ticket)));
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "TICKET", accion = "ACTUALIZAR", id = "id_ticket")
    public TicketResponseDTO transferirTicket(Long id, TransferirTicketDTO dto) {
        dto.setRun_titular(dto.getRun_titular());
        Ticket ticket = ticketRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket no encontrado: " + id));
        String nombreEstado = obtenerNombreEstado(ticket.getEstado_ticket_id_estado());
        if (!List.of("VALIDO", "TRANSFERIDO").contains(normalizar(nombreEstado))) {
            throw new TicketOperacionInvalidaException(
                    "Solo se pueden transferir tickets VALIDOS o TRANSFERIDOS. Estado actual: " + nombreEstado);
        }
        Long idTransferido = obtenerIdPorNombre("TRANSFERIDO");
        if (idTransferido == null) {
            throw new TicketOperacionInvalidaException(
                    "Estado 'TRANSFERIDO' no disponible");
        }
        if (ticket.getRun_titular().equalsIgnoreCase(dto.getRun_titular())) {
            throw new TicketOperacionInvalidaException("El nuevo titular debe tener un RUN distinto");
        }
        ticket.setNombre_titular(dto.getNombre_titular());
        ticket.setRun_titular(dto.getRun_titular());
        ticket.setCod_qr(QRGenerator.generarCodigoQR());
        ticket.setEstado_ticket_id_estado(idTransferido);
        return toResponseDTO(ticketRepository.saveAndFlush(ticket));
    }

    // ── Consultas ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public TicketResponseDTO obtenerTicket(Long id) {
        return ticketRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new TicketNotFoundException("Ticket no encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public Optional<TicketResponseDTO> obtenerPorQR(String codQR) {
        return ticketRepository.findByCod_qr(codQR).map(this::toResponseDTO);
    }

    @Transactional(readOnly = true)
    public List<TicketResponseDTO> listarTickets() {
        return ticketRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketResponseDTO> listarPorEvento(Long eventoId) {
        return ticketRepository.findByEvento_id_evento(eventoId).stream()
                .map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketResponseDTO> listarPorVenta(Long ventaId) {
        return ticketRepository.findByVenta_id_venta(ventaId).stream()
                .map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketResponseDTO> listarPorSector(Long sectorId) {
        return ticketRepository.findBySector_id_sector(sectorId).stream()
                .map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketResponseDTO> listarPorRun(String run) {
        return ticketRepository.findByRun_titular(RunUtil.normalizar(run)).stream()
                .map(this::toResponseDTO).collect(Collectors.toList());
    }
}
