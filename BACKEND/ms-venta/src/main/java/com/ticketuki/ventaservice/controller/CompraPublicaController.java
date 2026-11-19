package com.ticketuki.ventaservice.controller;

import com.ticketuki.ventaservice.dto.CompraPublicaDTO;
import com.ticketuki.ventaservice.service.*;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/compras/publicas")
@RequiredArgsConstructor
public class CompraPublicaController {
    private final CompraPublicaService service;
    private final CompraProcesador procesador;
    @GetMapping("/por-clave/{clave}")
    public CompraService.Compra porClave(@PathVariable String clave, @RequestHeader("X-Compra-Token") String secreto) {
        return service.porClave(clave, secreto);
    }
    @PostMapping
    public CompraService.Compra crear(@Valid @RequestBody CompraPublicaDTO dto,
            @RequestHeader("X-Compra-Token") String secreto, HttpServletRequest request) {
        var compra = service.crear(dto, secreto, request.getHeader("Authorization") != null);
        procesador.procesarInmediato(compra.pago_id());
        return service.obtener(compra.id(), secreto);
    }
    @GetMapping("/{id}")
    public CompraService.Compra obtener(@PathVariable Long id, @RequestHeader("X-Compra-Token") String secreto) {
        return service.obtener(id, secreto);
    }
    @PostMapping("/{id}/confirmar-simulado")
    public CompraService.Compra confirmar(@PathVariable Long id, @RequestHeader("X-Compra-Token") String secreto) {
        var compra = service.confirmar(id, secreto);
        procesador.procesarInmediato(compra.pago_id());
        return service.obtener(id, secreto);
    }
    @GetMapping("/{id}/resultado")
    public java.util.Map<String,Object> resultado(@PathVariable Long id, @RequestHeader("X-Compra-Token") String secreto) {
        return service.resultado(id, secreto);
    }
}
