package com.ticketuki.authservice.service;

import com.ticketuki.authservice.model.UsuarioAuth;
import com.ticketuki.authservice.repository.UsuarioAuthRepository;
import com.ticketuki.authservice.security.JwtUtil;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.Objects;

@Service
public class SesionService {
    private final UsuarioAuthRepository repository;
    private final JwtUtil jwt;
    public SesionService(UsuarioAuthRepository repository, JwtUtil jwt) {
        this.repository = repository;
        this.jwt = jwt;
    }
    public UsuarioAuth autenticar(String authorization) {
        io.jsonwebtoken.Claims claims;
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) throw new IllegalArgumentException();
            claims = jwt.validar(authorization.substring(7));
            if (!(claims.get("id") instanceof Number) || !(claims.get("version") instanceof Number)) throw new IllegalArgumentException();
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesión inválida o vencida");
        }
        var usuario = repository.findById(((Number) claims.get("id")).longValue())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesión inválida o vencida"));
        Long perfil = claims.get("usuarioId") instanceof Number n ? n.longValue() : null;
        if (!usuario.isActivo() || usuario.getTokenVersion() != ((Number) claims.get("version")).longValue()
                || !Objects.equals(usuario.getUsername(), claims.getSubject())
                || !Objects.equals(usuario.getRol().name(), claims.get("rol"))
                || !Objects.equals(usuario.getUsuarioId(), perfil))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La sesión ya no está vigente");
        if (org.springframework.web.context.request.RequestContextHolder.getRequestAttributes()
                instanceof org.springframework.web.context.request.ServletRequestAttributes attrs) {
            attrs.getRequest().setAttribute(com.ticketuki.common.security.AccesoServicio.class.getName(),
                new com.ticketuki.common.security.AccesoServicio.Actor(usuario.getId_usuario_auth(),
                    usuario.getUsername(), usuario.getRol().name(), usuario.getUsuarioId(), usuario.isActivo()));
        }
        return usuario;
    }
}
