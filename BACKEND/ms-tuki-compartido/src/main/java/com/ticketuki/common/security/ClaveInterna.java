package com.ticketuki.common.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class ClaveInterna {
    private ClaveInterna() {}
    public static void validar(String configurada, String recibida) {
        if (configurada == null || configurada.isBlank())
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Comunicación interna sin configurar");
        if (recibida == null || !MessageDigest.isEqual(configurada.getBytes(StandardCharsets.UTF_8), recibida.getBytes(StandardCharsets.UTF_8)))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credencial interna inválida");
    }
}
