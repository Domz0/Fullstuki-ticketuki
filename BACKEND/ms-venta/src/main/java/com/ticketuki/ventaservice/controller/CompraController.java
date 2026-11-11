package com.ticketuki.ventaservice.controller;

import com.ticketuki.ventaservice.dto.CompraRequestDTO;
import com.ticketuki.ventaservice.service.CompraService;
import com.ticketuki.ventaservice.security.CompradorRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/compras")
@RequiredArgsConstructor
public class CompraController {
    private final CompraService service;

    @PostMapping
    public CompraService.Compra crear(@Valid @RequestBody CompraRequestDTO dto, HttpServletRequest request) {
        dto.venta().getDetalles().forEach(d -> CompradorRequest.validar(request, d.getUsuario_id_usuario()));
        return service.crear(dto);
    }

    @GetMapping("/{id}")
    public CompraService.Compra obtener(@PathVariable Long id, HttpServletRequest request) {
        var compra = service.obtener(id);
        CompradorRequest.validar(request, compra.usuario_id());
        return compra;
    }
}
