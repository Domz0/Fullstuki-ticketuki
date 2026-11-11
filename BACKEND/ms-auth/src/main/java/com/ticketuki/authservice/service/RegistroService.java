package com.ticketuki.authservice.service;

import com.ticketuki.authservice.client.RegistroUsuarioClient;
import com.ticketuki.authservice.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.security.MessageDigest;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class RegistroService {
    private final RegistroStore store;
    private final RegistroUsuarioClient usuarios;
    private final AuthService auth;
    private final ObjectMapper mapper;

    public LoginResponseDTO registrar(RegistroRequestDTO dto) {
        String fingerprint;
        try {
            fingerprint = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(mapper.writeValueAsBytes(dto.getUsuario())));
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo preparar el registro", ex);
        }
        try {
            var reserva = store.reservar(dto, fingerprint);
            if (!reserva.activo()) {
                Long usuarioId = usuarios.registrar(reserva.clave(), dto.getUsuario());
                store.activar(reserva.authId(), usuarioId);
            }
            return auth.login(new LoginRequestDTO(dto.getUsername(), dto.getPassword()));
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Registro en conflicto. Reintentar con los mismos datos", ex);
        }
    }
}
