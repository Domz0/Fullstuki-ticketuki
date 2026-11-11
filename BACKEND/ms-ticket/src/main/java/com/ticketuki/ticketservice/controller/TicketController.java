package com.ticketuki.ticketservice.controller;

import com.ticketuki.ticketservice.dto.TicketRequestDTO;
import com.ticketuki.ticketservice.dto.TicketResponseDTO;
import com.ticketuki.ticketservice.dto.TicketUpdateDTO;
import com.ticketuki.ticketservice.dto.TransferirTicketDTO;
import com.ticketuki.ticketservice.dto.ValidarTicketResponseDTO;
import com.ticketuki.ticketservice.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
@Slf4j
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> listarTickets() {
        return ResponseEntity.ok(ticketService.listarTickets());
    }

    @PostMapping
    public ResponseEntity<TicketResponseDTO> crearTicket(@Valid @RequestBody TicketRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.crearTicket(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> obtenerTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.obtenerTicket(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> actualizarTicket(
            @PathVariable Long id, @Valid @RequestBody TicketUpdateDTO dto) {
        return ResponseEntity.ok(ticketService.actualizarTicket(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTicket(@PathVariable Long id) {
        ticketService.eliminarTicket(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/estado/{idEstado}")
    public ResponseEntity<TicketResponseDTO> cambiarEstado(
            @PathVariable Long id, @PathVariable Long idEstado) {
        return ResponseEntity.ok(ticketService.cambiarEstado(id, idEstado));
    }

    @PostMapping("/validar/{codQR}")
    public ResponseEntity<ValidarTicketResponseDTO> validarTicket(@PathVariable String codQR) {
        return ResponseEntity.ok(ticketService.validarTicket(codQR));
    }

    @PutMapping("/{id}/transferir")
    public ResponseEntity<TicketResponseDTO> transferirTicket(
            @PathVariable Long id, @Valid @RequestBody TransferirTicketDTO dto) {
        return ResponseEntity.ok(ticketService.transferirTicket(id, dto));
    }

    @GetMapping("/evento/{idEvento}")
    public ResponseEntity<List<TicketResponseDTO>> listarPorEvento(@PathVariable Long idEvento) {
        return ResponseEntity.ok(ticketService.listarPorEvento(idEvento));
    }

    @GetMapping("/venta/{idVenta}")
    public ResponseEntity<List<TicketResponseDTO>> listarPorVenta(@PathVariable Long idVenta) {
        return ResponseEntity.ok(ticketService.listarPorVenta(idVenta));
    }

    @GetMapping("/sector/{idSector}")
    public ResponseEntity<List<TicketResponseDTO>> listarPorSector(@PathVariable Long idSector) {
        return ResponseEntity.ok(ticketService.listarPorSector(idSector));
    }

    @GetMapping("/qr/{codQR}")
    public ResponseEntity<TicketResponseDTO> obtenerPorQR(@PathVariable String codQR) {
        return ticketService.obtenerPorQR(codQR)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/titular/{run}")
    public ResponseEntity<List<TicketResponseDTO>> listarPorRun(@PathVariable String run) {
        return ResponseEntity.ok(ticketService.listarPorRun(run));
    }

    @GetMapping("/disponibilidad/{evento}/{sector}")
    public TicketService.Disponibilidad disponibilidad(@PathVariable Long evento, @PathVariable Long sector) {
        return ticketService.disponibilidad(evento, sector);
    }
}
