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
    private final com.ticketuki.authservice.client.LoginUsuarioClient perfiles;
    private final SesionService sesiones;

    @Transactional(readOnly = true)
    public LoginResponseDTO login(LoginRequestDTO dto) {
        log.info("Intento de login para usuario: {}", dto.getUsername());

        // 1. Buscar el usuario por username
        String identificador = dto.getUsername().trim().toLowerCase(java.util.Locale.ROOT);
        var cuenta = usuarioAuthRepository.findByUsername(identificador);
        if (cuenta.isEmpty() && identificador.contains("@")) {
            cuenta = perfiles.buscarPorCorreo(identificador).flatMap(usuarioAuthRepository::findByUsuarioId);
        }
        UsuarioAuth usuario = cuenta
                .orElseThrow(() -> new CredencialesInvalidasException("Usuario o contraseña incorrectos"));

        // 2. Comparación directa de credenciales
        if (!usuario.isActivo() || !usuario.getPassword().equals(dto.getPassword())) {
            throw new CredencialesInvalidasException("Usuario o contraseña incorrectos");
        }

        // 3. Generar el JWT firmado
        String token = jwtUtil.generarToken(usuario);
        log.info("Login exitoso para usuario: {}", usuario.getUsername());

        return new LoginResponseDTO(token, "Bearer", usuario.getUsername(),
                jwtUtil.getExpiracionMs(), usuario.getId_usuario_auth(),
                usuario.getUsuarioId(), usuario.getRol());
    }


    @Transactional(readOnly = true)
    public LoginResponseDTO renovar(String authorization) {
        UsuarioAuth usuario = sesiones.autenticar(authorization);
        var claims = jwtUtil.validar(authorization.substring(7));
        long inicio = claims.get("inicio") instanceof Number n ? n.longValue() : claims.getIssuedAt().getTime();
        if (System.currentTimeMillis() - inicio > jwtUtil.getSesionMaximaMs()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "La sesión superó el tiempo máximo. Inicia sesión nuevamente.");
        }
        String token = jwtUtil.generarToken(usuario, inicio);
        log.info("Token renovado para usuario: {}", usuario.getUsername());
        return new LoginResponseDTO(token, "Bearer", usuario.getUsername(),
                jwtUtil.getExpiracionMs(), usuario.getId_usuario_auth(),
                usuario.getUsuarioId(), usuario.getRol());
    }
}
