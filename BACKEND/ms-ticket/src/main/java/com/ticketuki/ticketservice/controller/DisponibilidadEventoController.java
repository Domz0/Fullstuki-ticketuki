package com.ticketuki.ticketservice.controller;

import com.ticketuki.ticketservice.service.DisponibilidadEventoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class DisponibilidadEventoController {
    private final DisponibilidadEventoService disponibilidad;
    @GetMapping("/tickets/disponibilidad/evento/{id}")
    public DisponibilidadEventoService.Resumen consultar(@PathVariable Long id) {
        return disponibilidad.consultar(id);
    }
}
