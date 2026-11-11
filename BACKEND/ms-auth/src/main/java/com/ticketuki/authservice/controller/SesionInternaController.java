package com.ticketuki.authservice.controller;

import com.ticketuki.authservice.service.SesionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import com.ticketuki.common.security.ClaveInterna;

@RestController
public class SesionInternaController {
    private final SesionService sesiones;
    private final String key;
    public SesionInternaController(SesionService sesiones, @Value("${internal.service-key:}") String key) {
        this.sesiones = sesiones;
        this.key = key;
    }
    @PostMapping("/interno/sesiones/validar")
    public void validar(@RequestHeader(value="X-Internal-Key", defaultValue="") String recibida,
                        @RequestHeader("Authorization") String token) {
        ClaveInterna.validar(key, recibida);
        sesiones.autenticar(token);
    }
}
