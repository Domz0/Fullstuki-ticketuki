package com.ticketuki.eventoservice.controller;

import com.ticketuki.eventoservice.dto.EventoRequestDTO;
import com.ticketuki.eventoservice.dto.EventoResponseDTO;
import com.ticketuki.eventoservice.service.EventoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/eventos")
@RequiredArgsConstructor
@Slf4j
public class EventoController {
    private final EventoService eventoService;

    @PutMapping("/{id}/destacado")
    public ResponseEntity<EventoResponseDTO> destacar(@PathVariable Long id) {
        return ResponseEntity.ok(eventoService.destacar(id));
    }

    @GetMapping
    public ResponseEntity<List<EventoResponseDTO>> obtenerTodos() {
        log.info("GET /eventos - Listando eventos");
        return ResponseEntity.ok(eventoService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventoResponseDTO> obtenerPorId(@PathVariable Long id) {
        log.info("GET /eventos/{} - Obteniendo evento", id);
        return ResponseEntity.ok(eventoService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<EventoResponseDTO> crear(@Valid @RequestBody EventoRequestDTO eventoDTO) {
        log.info("POST /eventos - Creando evento");
        return ResponseEntity.status(HttpStatus.CREATED).body(eventoService.crear(eventoDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventoResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody EventoRequestDTO eventoDTO) {
        log.info("PUT /eventos/{} - Actualizando evento", id);
        return ResponseEntity.ok(eventoService.actualizar(id, eventoDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.info("DELETE /eventos/{} - Eliminando evento", id);
        eventoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<List<EventoResponseDTO>> obtenerPorFecha(@PathVariable LocalDate fecha) {
        log.info("GET /eventos/fecha/{} - Buscando eventos por fecha", fecha);
        return ResponseEntity.ok(eventoService.obtenerPorFecha(fecha));
    }

    @GetMapping("/recinto/{recintoId}")
    public ResponseEntity<List<EventoResponseDTO>> obtenerPorRecinto(@PathVariable Long recintoId) {
        log.info("GET /eventos/recinto/{} - Buscando eventos por recinto", recintoId);
        return ResponseEntity.ok(eventoService.obtenerPorRecinto(recintoId));
    }

    @PutMapping("/{id}/estado/{idEstado}")
    public ResponseEntity<EventoResponseDTO> cambiarEstado(@PathVariable Long id, @PathVariable Long idEstado) {
        log.info("PUT /eventos/{}/estado/{} - Cambiando estado", id, idEstado);
        return ResponseEntity.ok(eventoService.cambiarEstado(id, idEstado));
    }
}
