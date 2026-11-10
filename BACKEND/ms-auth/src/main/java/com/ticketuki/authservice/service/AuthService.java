package com.ticketuki.authservice.service;

import com.ticketuki.authservice.dto.LoginRequestDTO;
import com.ticketuki.authservice.dto.LoginResponseDTO;
import com.ticketuki.authservice.exception.CredencialesInvalidasException;
import com.ticketuki.authservice.model.UsuarioAuth;
import com.ticketuki.authservice.repository.UsuarioAuthRepository;
import com.ticketuki.authservice.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioAuthRepository usuarioAuthRepository;
    private final JwtUtil jwtUtil;

    @Transactional(readOnly = true)
    public LoginResponseDTO login(LoginRequestDTO dto) {
        log.info("Intento de login para usuario: {}", dto.getUsername());

        // 1. Buscar el usuario por username
        UsuarioAuth usuario = usuarioAuthRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new CredencialesInvalidasException("Usuario o contraseña incorrectos"));

        // 2. Comparación directa de credenciales
        if (!usuario.getPassword().equals(dto.getPassword())) {
            throw new CredencialesInvalidasException("Usuario o contraseña incorrectos");
        }

        // 3. Generar el JWT firmado
        String token = jwtUtil.generarToken(usuario);
        log.info("Login exitoso para usuario: {}", usuario.getUsername());

        return new LoginResponseDTO(token, "Bearer", usuario.getUsername(),
                jwtUtil.getExpiracionMs(), usuario.getId_usuario_auth(),
                usuario.getUsuarioId(), usuario.getRol());
    }
}
