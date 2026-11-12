package com.ticketuki.ventaservice.pago.controller;

import com.ticketuki.ventaservice.pago.dto.PagoRequestDTO;
import com.ticketuki.ventaservice.pago.dto.PagoResponseDTO;
import com.ticketuki.ventaservice.pago.model.EstadoPago;
import com.ticketuki.ventaservice.pago.service.PagoService;
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
@RequestMapping("/pagos")
@RequiredArgsConstructor
@Slf4j
public class PagoController {

    private final PagoService pagoService;

    @PostMapping
    public ResponseEntity<PagoResponseDTO> procesarPago(@Valid @RequestBody PagoRequestDTO dto, jakarta.servlet.http.HttpServletRequest request) {
        log.info("POST /pagos - venta: {}, usuario: {}", dto.getVenta_id(), dto.getUsuario_id());
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoService.procesarPago(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagoResponseDTO> obtenerPago(@PathVariable Long id) {
        log.info("GET /pagos/{}", id);
        return ResponseEntity.ok(pagoService.obtenerPago(id));
    }

    @GetMapping("/venta/{idVenta}")
    public ResponseEntity<List<PagoResponseDTO>> listarPorVenta(@PathVariable Long idVenta) {
        log.info("GET /pagos/venta/{}", idVenta);
        return ResponseEntity.ok(pagoService.listarPorVenta(idVenta));
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<PagoResponseDTO>> listarPorUsuario(@PathVariable Long idUsuario) {
        log.info("GET /pagos/usuario/{}", idUsuario);
        return ResponseEntity.ok(pagoService.listarPorUsuario(idUsuario));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<PagoResponseDTO>> listarPorEstado(@PathVariable EstadoPago estado) {
        log.info("GET /pagos/estado/{}", estado);
        return ResponseEntity.ok(pagoService.listarPorEstado(estado));
    }

    @GetMapping("/fecha")
    public ResponseEntity<List<PagoResponseDTO>> listarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        log.info("GET /pagos/fecha?desde={}&hasta={}", desde, hasta);
        return ResponseEntity.ok(pagoService.listarPorPeriodo(desde, hasta));
    }

    @PutMapping("/{id}/completar")
    public ResponseEntity<PagoResponseDTO> completarPago(@PathVariable Long id) {
        log.info("PUT /pagos/{}/completar", id);
        return ResponseEntity.accepted().body(pagoService.completarPago(id));
    }

    @PutMapping("/{id}/reembolso")
    public ResponseEntity<PagoResponseDTO> procesarReembolso(@PathVariable Long id) {
        log.info("PUT /pagos/{}/reembolso", id);
        return ResponseEntity.accepted().body(pagoService.procesarReembolso(id));
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<PagoResponseDTO> cancelarPago(@PathVariable Long id) {
        log.info("PUT /pagos/{}/cancelar", id);
        return ResponseEntity.accepted().body(pagoService.cancelarPago(id));
    }
}
