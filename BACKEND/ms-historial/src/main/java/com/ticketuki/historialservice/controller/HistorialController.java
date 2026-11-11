package com.ticketuki.historialservice.controller;

import com.ticketuki.historialservice.dto.HistorialRequestDTO;
import com.ticketuki.historialservice.dto.HistorialResponseDTO;
import com.ticketuki.historialservice.model.TipoEntidad;
import com.ticketuki.historialservice.service.HistorialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/historial")
@RequiredArgsConstructor
@Slf4j
public class HistorialController {

    private final HistorialService historialService;


    @GetMapping("/{idHistorial}")
    public ResponseEntity<HistorialResponseDTO> obtenerHistorial(@PathVariable Long idHistorial) {
        return ResponseEntity.ok(historialService.obtenerHistorial(idHistorial));
    }

    @GetMapping
    public ResponseEntity<List<HistorialResponseDTO>> listarHistorial() {
        return ResponseEntity.ok(historialService.listarHistorial());
    }

    @GetMapping("/entidad/{entidad}/{idEntidad}")
    public ResponseEntity<List<HistorialResponseDTO>> obtenerPorEntidad(
            @PathVariable TipoEntidad entidad, @PathVariable Long idEntidad) {
        return ResponseEntity.ok(historialService.obtenerPorEntidad(entidad, idEntidad));
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<HistorialResponseDTO>> obtenerPorUsuario(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(historialService.obtenerPorUsuario(idUsuario));
    }

    @GetMapping("/fecha/{inicio}/{fin}")
    public ResponseEntity<List<HistorialResponseDTO>> obtenerPorPeriodo(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(historialService.obtenerPorPeriodo(inicio, fin));
    }
}
