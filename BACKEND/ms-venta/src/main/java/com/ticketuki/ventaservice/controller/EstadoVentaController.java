package com.ticketuki.ventaservice.controller;

import com.ticketuki.ventaservice.model.EstadoVenta;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/estadosVenta")
public class EstadoVentaController {
    public record EstadoDTO(Long id, String nombre) {}

    @GetMapping
    public List<EstadoDTO> listar() {
        return Arrays.stream(EstadoVenta.values())
                .map(e -> new EstadoDTO(e.getId(), e.name())).toList();
    }

    @GetMapping("/{id}")
    public EstadoDTO obtener(@PathVariable Long id) {
        var estado = EstadoVenta.fromId(id);
        return new EstadoDTO(estado.getId(), estado.name());
    }
}
