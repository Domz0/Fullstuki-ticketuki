package com.ticketuki.ventaservice.promocion.controller;

import com.ticketuki.ventaservice.promocion.dto.PromocionRequestDTO;
import com.ticketuki.ventaservice.promocion.dto.PromocionResponseDTO;
import com.ticketuki.ventaservice.promocion.service.PromocionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/promociones")
@RequiredArgsConstructor
@Slf4j
public class PromocionController {

    private final PromocionService promocionService;

    @GetMapping
    public ResponseEntity<List<PromocionResponseDTO>> listarPromociones() {
        log.info("GET /promociones - Listando todas las promociones");
        return ResponseEntity.ok(promocionService.listarPromociones());
    }

    @PostMapping
    public ResponseEntity<PromocionResponseDTO> crearPromocion(@Valid @RequestBody PromocionRequestDTO dto) {
        log.info("POST /promociones - Creando promoción para empresa: {}", dto.getEmpresa());
        return ResponseEntity.status(HttpStatus.CREATED).body(promocionService.crearPromocion(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromocionResponseDTO> obtenerPromocion(@PathVariable Long id) {
        log.info("GET /promociones/{} - Obteniendo promoción", id);
        return ResponseEntity.ok(promocionService.obtenerPromocion(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromocionResponseDTO> actualizarPromocion(@PathVariable Long id, @Valid @RequestBody PromocionRequestDTO dto) {
        log.info("PUT /promociones/{} - Actualizando promoción", id);
        return ResponseEntity.ok(promocionService.actualizarPromocion(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPromocion(@PathVariable Long id) {
        log.info("DELETE /promociones/{} - Eliminando promoción", id);
        promocionService.eliminarPromocion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/activas")
    public ResponseEntity<List<PromocionResponseDTO>> listarActivas() {
        log.info("GET /promociones/activas - Listando promociones activas");
        return ResponseEntity.ok(promocionService.listarActivas());
    }

    @GetMapping("/empresa/{empresa}")
    public ResponseEntity<List<PromocionResponseDTO>> listarPorEmpresa(@PathVariable String empresa) {
        log.info("GET /promociones/empresa/{} - Listando promociones por empresa", empresa);
        return ResponseEntity.ok(promocionService.listarPorEmpresa(empresa));
    }

}
