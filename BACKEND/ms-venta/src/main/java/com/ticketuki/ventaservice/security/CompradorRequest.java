package com.ticketuki.ventaservice.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class CompradorRequest {
    private CompradorRequest() {}

    public static void validar(HttpServletRequest request, Long comprador) {
        Object value = request.getAttribute(com.ticketuki.common.security.AccesoServicio.class.getName());
        if (value instanceof com.ticketuki.common.security.AccesoServicio.Actor actor && actor.activo()) {
            if ("ADMIN".equals(actor.rol()) || "INTERNO".equals(actor.rol())) return;
            if ("CLIENTE".equals(actor.rol()) && comprador != null && comprador.equals(actor.usuarioId())) return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El comprador debe coincidir con el usuario autenticado");
    }
}
