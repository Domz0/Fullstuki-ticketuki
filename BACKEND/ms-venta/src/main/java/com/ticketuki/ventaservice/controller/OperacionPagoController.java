package com.ticketuki.ventaservice.controller;

import com.ticketuki.ventaservice.service.OperacionPagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/pagos")
@RequiredArgsConstructor
public class OperacionPagoController {
    private final OperacionPagoService service;

    @GetMapping("/{id}/operacion")
    public Map<String,Object> obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping("/{id}/reintentar")
    public void reintentar(@PathVariable Long id) {
        service.reintentar(id);
    }
}
