package com.ticketuki.usuarioservice.controller;

import com.ticketuki.usuarioservice.dto.*;
import com.ticketuki.usuarioservice.service.RegistroUsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.UUID;

@RestController
public class RegistroInternoController {
    private final RegistroUsuarioService service;
    private final String key;

    public RegistroInternoController(RegistroUsuarioService service, @Value("${internal.service-key:}") String key) {
        this.service = service;
        this.key = key;
    }

    @PostMapping("/interno/registros/{id}")
    public UsuarioResponseDTO registrar(@PathVariable UUID id,
            @RequestHeader(value = "X-Internal-Key", defaultValue = "") String recibida,
            @Valid @RequestBody UsuarioRequestDTO dto) {
        if (key.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Registro interno no configurado");
        if (!MessageDigest.isEqual(key.getBytes(StandardCharsets.UTF_8), recibida.getBytes(StandardCharsets.UTF_8)))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credencial interna inválida");
        return service.registrar(id.toString(), dto);
    }
}
