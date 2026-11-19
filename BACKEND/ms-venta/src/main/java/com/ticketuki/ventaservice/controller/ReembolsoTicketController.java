package com.ticketuki.ventaservice.controller;

import com.ticketuki.ventaservice.service.ReembolsoTicketService;
import com.ticketuki.common.security.ClaveInterna;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
public class ReembolsoTicketController {
    private final ReembolsoTicketService service;
    private final String clave;
    public ReembolsoTicketController(ReembolsoTicketService service, @Value("${internal.service-key:${INTERNAL_SERVICE_KEY:}}") String clave) {
        this.service=service; this.clave=clave;
    }
    @PostMapping("/interno/devoluciones/{id}")
    public void registrar(@PathVariable Long id, @RequestHeader(value="X-Internal-Key",required=false) String key) {
        ClaveInterna.validar(clave,key); service.registrar(id);
    }
    @GetMapping("/ventas/reembolsos")
    public List<Map<String,Object>> listar() { return service.listar(); }
}
