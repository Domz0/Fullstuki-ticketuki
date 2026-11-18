package com.ticketuki.eventoservice.controller;

import com.ticketuki.eventoservice.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/eventos/{evento}/sectores")
public class SectoresEventoController {
    private final SectoresEventoService sectores;
    private final EventoService eventos;
    @GetMapping
    public List<SectoresEventoService.Sector> listar(@PathVariable Long evento) {
        eventos.obtenerPorId(evento);
        return sectores.listar(evento);
    }
    @GetMapping("/{sector}")
    public SectoresEventoService.Sector obtener(@PathVariable Long evento, @PathVariable Long sector) {
        return sectores.obtener(evento, sector);
    }
}
