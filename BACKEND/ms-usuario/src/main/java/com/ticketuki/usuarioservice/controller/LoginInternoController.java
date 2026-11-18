package com.ticketuki.usuarioservice.controller;

import com.ticketuki.usuarioservice.repository.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class LoginInternoController {
    private final UsuarioRepository usuarios;
    private final String key;
    public record Perfil(Long id_usuario) {}

    public LoginInternoController(UsuarioRepository usuarios, @Value("${internal.service-key:}") String key) {
        this.usuarios = usuarios;
        this.key = key;
    }

    @GetMapping("/interno/usuarios/por-correo")
    public Perfil buscar(@RequestParam String correo,
            @RequestHeader(value = "X-Internal-Key", defaultValue = "") String recibida) {
        if (key.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Consulta interna no configurada");
        if (!MessageDigest.isEqual(key.getBytes(StandardCharsets.UTF_8), recibida.getBytes(StandardCharsets.UTF_8)))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credencial interna invalida");
        return usuarios.findByEmailIgnoreCase(correo.trim())
                .map(usuario -> new Perfil(usuario.getId_usuario()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
