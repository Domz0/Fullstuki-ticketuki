package com.ticketuki.ventaservice.controller;

import com.ticketuki.ventaservice.service.CodigosDescuento;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/compras/codigos")
public class CodigosDescuentoController {
    private final CodigosDescuento service;
    @GetMapping public List<Map<String,Object>> listar() { return service.listar(); }
    @PostMapping public Map<String,Object> crear(@Valid @RequestBody CodigosDescuento.Nuevo dto) { return service.crear(dto); }
    @GetMapping("/validar") public Map<String,Object> validar(@RequestParam String codigo, @RequestParam Long evento) {
        return service.consultar(codigo, evento);
    }
}
