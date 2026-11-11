package com.ticketuki.ticketservice.controller;

import com.ticketuki.ticketservice.model.EstadoTicket;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/estadosTicket")
public class EstadoTicketController {
    public record EstadoDTO(Long id, String nombre) {}

    @GetMapping
    public List<EstadoDTO> listar() {
        return Arrays.stream(EstadoTicket.values())
                .map(e -> new EstadoDTO(e.getId(), e.name())).toList();
    }

    @GetMapping("/{id}")
    public EstadoDTO obtener(@PathVariable Long id) {
        var estado = EstadoTicket.fromId(id);
        return new EstadoDTO(estado.getId(), estado.name());
    }
}
