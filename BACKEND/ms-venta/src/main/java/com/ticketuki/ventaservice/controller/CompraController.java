package com.ticketuki.ventaservice.controller;

import com.ticketuki.ventaservice.dto.CompraRequestDTO;
import com.ticketuki.ventaservice.service.CompraService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/compras")
@RequiredArgsConstructor
public class CompraController {
    private final CompraService service;
    private final com.ticketuki.ventaservice.pago.service.PagoService pagos;

    @PostMapping("/{id}/confirmar-simulado")
    public CompraService.Compra confirmarSimulado(@PathVariable Long id) {
        var compra = service.obtener(id);
        pagos.simularPago(compra.pago_id());
        return service.obtener(id);
    }

    @PostMapping
    public CompraService.Compra crear(@Valid @RequestBody CompraRequestDTO dto, HttpServletRequest request) {
        return service.crear(dto);
    }

    @GetMapping("/{id}")
    public CompraService.Compra obtener(@PathVariable Long id, HttpServletRequest request) {
        var compra = service.obtener(id);
        return compra;
    }
}
