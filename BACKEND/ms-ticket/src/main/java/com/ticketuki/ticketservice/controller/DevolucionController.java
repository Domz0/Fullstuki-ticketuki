package com.ticketuki.ticketservice.controller;

import com.ticketuki.ticketservice.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class DevolucionController {
    private final DevolucionService service;
    private final DevolucionEnvio envio;
    @PostMapping("/tickets/{id}/devolver")
    public Map<String,Object> devolver(@PathVariable Long id) {
        service.solicitar(id);
        envio.enviar(id);
        return service.estado(id);
    }
}
