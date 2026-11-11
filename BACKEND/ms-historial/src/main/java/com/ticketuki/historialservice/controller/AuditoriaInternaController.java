package com.ticketuki.historialservice.controller;

import com.ticketuki.historialservice.dto.EventoInternoDTO;
import com.ticketuki.historialservice.service.AuditoriaInternaService;
import com.ticketuki.common.security.ClaveInterna;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

@RestController
public class AuditoriaInternaController {
    private final AuditoriaInternaService service;
    private final String key;
    public AuditoriaInternaController(AuditoriaInternaService service, @Value("${INTERNAL_SERVICE_KEY:}") String key) {
        this.service = service;
        this.key = key;
    }
    @PostMapping("/interno/historial")
    public void registrar(@RequestHeader(value="X-Internal-Key", defaultValue="") String recibida,
                          @Valid @RequestBody EventoInternoDTO dto) {
        ClaveInterna.validar(key, recibida);
        service.registrar(dto);
    }
}
