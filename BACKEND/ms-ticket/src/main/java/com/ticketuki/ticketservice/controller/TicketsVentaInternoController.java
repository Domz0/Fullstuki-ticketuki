package com.ticketuki.ticketservice.controller;

import com.ticketuki.common.security.ClaveInterna;
import com.ticketuki.ticketservice.dto.*;
import com.ticketuki.ticketservice.service.TicketsVentaService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/interno/ventas")
public class TicketsVentaInternoController {
    private final TicketsVentaService service;
    private final String clave;

    public TicketsVentaInternoController(TicketsVentaService service,
            @Value("${internal.service-key:${INTERNAL_SERVICE_KEY:}}") String clave) {
        this.service = service;
        this.clave = clave;
    }

    public record Emision(@NotEmpty @Size(max = 100) List<@NotNull @Valid TicketRequestDTO> tickets) {}

    @PostMapping("/{id}/reserva")
    public com.ticketuki.ticketservice.service.OperacionVentaStore.Reserva reservar(@PathVariable Long id,
            @RequestHeader(value="X-Internal-Key", required=false) String key, @Valid @RequestBody Emision emision) {
        ClaveInterna.validar(clave, key);
        return service.reservar(id, emision.tickets());
    }

    @GetMapping("/{id}/reserva")
    public com.ticketuki.ticketservice.service.OperacionVentaStore.Reserva reserva(@PathVariable Long id,
            @RequestHeader(value="X-Internal-Key", required=false) String key) {
        ClaveInterna.validar(clave, key);
        return service.consultarReserva(id);
    }

    @PostMapping("/{id}/reserva/confirmar")
    public com.ticketuki.ticketservice.service.OperacionVentaStore.Reserva confirmar(@PathVariable Long id,
            @RequestHeader(value="X-Internal-Key", required=false) String key) {
        ClaveInterna.validar(clave, key);
        return service.confirmarReserva(id);
    }

    @PostMapping("/{id}/tickets")
    public List<TicketResponseDTO> emitir(@PathVariable Long id, @RequestHeader(value="X-Internal-Key", required=false) String key,
            @Valid @RequestBody Emision emision) {
        ClaveInterna.validar(clave, key);
        return service.emitir(id, emision.tickets());
    }

    @PostMapping("/{id}/cancelar")
    public void cancelar(@PathVariable Long id, @RequestHeader(value="X-Internal-Key", required=false) String key) {
        ClaveInterna.validar(clave, key);
        service.cancelar(id);
    }
}
