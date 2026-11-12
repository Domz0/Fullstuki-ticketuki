package com.ticketuki.ventaservice.controller;

import com.ticketuki.ventaservice.dto.DetalleVentaResponseDTO;
import com.ticketuki.ventaservice.dto.VentaRequestDTO;
import com.ticketuki.ventaservice.dto.VentaResponseDTO;
import com.ticketuki.ventaservice.service.VentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
public class VentaController {

    private final VentaService ventaService;

    @GetMapping("/ventas")
    public ResponseEntity<List<VentaResponseDTO>> listarVentas() {
        return ResponseEntity.ok(ventaService.listarVentas());
    }

    @PostMapping("/ventas")
    public ResponseEntity<VentaResponseDTO> crearVenta(@Valid @RequestBody VentaRequestDTO dto, jakarta.servlet.http.HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ventaService.crearVenta(dto));
    }

    @GetMapping("/ventas/{id}")
    public ResponseEntity<VentaResponseDTO> obtenerVenta(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.obtenerVenta(id));
    }

    @PutMapping("/ventas/{id}/estado/{idEstado}")
    public ResponseEntity<VentaResponseDTO> cambiarEstado(@PathVariable Long id, @PathVariable Long idEstado) {
        return ResponseEntity.ok(ventaService.cambiarEstado(id, idEstado));
    }

    @GetMapping("/ventas/fecha/{fechaInicio}/{fechaFin}")
    public ResponseEntity<List<VentaResponseDTO>> listarPorPeriodo(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        return ResponseEntity.ok(ventaService.listarPorPeriodo(fechaInicio, fechaFin));
    }

    @GetMapping("/detalleVenta/{id}")
    public ResponseEntity<DetalleVentaResponseDTO> obtenerDetalle(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.obtenerDetalle(id));
    }

    @GetMapping("/detalleVenta/venta/{idVenta}")
    public ResponseEntity<List<DetalleVentaResponseDTO>> listarDetallesPorVenta(@PathVariable Long idVenta) {
        return ResponseEntity.ok(ventaService.listarDetallesPorVenta(idVenta));
    }
}
