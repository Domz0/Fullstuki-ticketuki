package com.ticketuki.eventoservice.controller;

import com.ticketuki.eventoservice.model.EstadoEvento;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/estadosEvento")
public class EstadoEventoController {
    public record EstadoDTO(Long id, String nombre) {}

    @GetMapping
    public List<EstadoDTO> listar() {
        return Arrays.stream(EstadoEvento.values())
                .map(e -> new EstadoDTO(e.getId(), e.name())).toList();
    }

    @GetMapping("/{id}")
    public EstadoDTO obtener(@PathVariable Long id) {
        var estado = EstadoEvento.fromId(id);
        return new EstadoDTO(estado.getId(), estado.name());
    }
}
