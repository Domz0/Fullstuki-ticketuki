package com.ticketuki.ventaservice.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class CompradorRequest {
    private CompradorRequest() {}

    public static void validar(HttpServletRequest request, Long comprador) {
        String rol = request.getHeader("X-Rol");
        if ("ADMIN".equals(rol)) return;
        if ("CLIENTE".equals(rol) && comprador != null
                && comprador.toString().equals(request.getHeader("X-Usuario-Id"))) return;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El comprador debe coincidir con el usuario autenticado");
    }
}
