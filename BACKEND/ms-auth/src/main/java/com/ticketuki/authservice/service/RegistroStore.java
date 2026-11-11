package com.ticketuki.authservice.service;

import com.ticketuki.authservice.dto.RegistroRequestDTO;
import com.ticketuki.authservice.model.*;
import com.ticketuki.authservice.repository.UsuarioAuthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistroStore {
    private final UsuarioAuthRepository repository;
    public record Reserva(Long authId, String clave, boolean activo) {}

    @Transactional
    public Reserva reservar(RegistroRequestDTO dto, String fingerprint) {
        var existente = repository.findForUpdateByUsername(dto.getUsername());
        if (existente.isPresent()) {
            var auth = existente.get();
            if (!auth.isActivo() && auth.getUsuarioId() != null)
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La cuenta está desactivada");
            if (!Objects.equals(auth.getRegistroFingerprint(), fingerprint)
                    || !Objects.equals(auth.getPassword(), dto.getPassword()) || auth.getRegistroId() == null)
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El username ya está registrado o tiene otro registro pendiente");
            return new Reserva(auth.getId_usuario_auth(), auth.getRegistroId(), auth.isActivo());
        }
        var auth = new UsuarioAuth(null, dto.getUsername(), dto.getPassword(), Rol.CLIENTE, null);
        auth.setActivo(false);
        auth.setRegistroId(UUID.randomUUID().toString());
        auth.setRegistroFingerprint(fingerprint);
        auth = repository.saveAndFlush(auth);
        return new Reserva(auth.getId_usuario_auth(), auth.getRegistroId(), false);
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "CUENTA", accion = "CREAR")
    public void activar(Long authId, Long usuarioId) {
        if (usuarioId == null || usuarioId <= 0) throw new IllegalArgumentException("Perfil de usuario inválido");
        var auth = repository.findForUpdate(authId).orElseThrow();
        if (auth.getUsuarioId() != null && !auth.getUsuarioId().equals(usuarioId))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El registro ya está vinculado a otro perfil");
        auth.setUsuarioId(usuarioId);
        auth.setActivo(true);
        repository.saveAndFlush(auth);
    }
}
