package com.ticketuki.ventaservice.controller;

import com.ticketuki.ventaservice.service.CompraPublicaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class InvitadosDebugController {
    private final CompraPublicaService compras;

    @GetMapping("/compras/invitados-debug")
    public java.util.Map<String, Object> listar(@RequestParam(defaultValue = "0") int pagina) {
        return compras.invitadosDebug(pagina);
    }
}
