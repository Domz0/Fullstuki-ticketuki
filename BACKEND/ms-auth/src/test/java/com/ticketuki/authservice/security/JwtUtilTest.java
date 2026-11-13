package com.ticketuki.authservice.security;

import com.ticketuki.authservice.model.UsuarioAuth;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import static org.assertj.core.api.Assertions.*;

class JwtUtilTest {
    @Test void firmaIdentidadYExpira() {
        var jwt = new JwtUtil();
        ReflectionTestUtils.setField(jwt, "secret", "ticketuki-jwt-secret-key-muy-larga-y-segura-2024-cambiar");
        ReflectionTestUtils.setField(jwt, "expiracionMs", 60000L);
        var usuario = new UsuarioAuth();
        usuario.setId_usuario_auth(10L);
        usuario.setUsername("cliente");
        usuario.setUsuarioId(1L);
        var token = jwt.generarToken(usuario);
        var claims = jwt.validar(token);
        assertThat(claims.get("usuarioId", Number.class).longValue()).isEqualTo(1L);
        assertThat(claims.get("rol", String.class)).isEqualTo("CLIENTE");
        ReflectionTestUtils.setField(jwt, "secret", "otra-clave-segura-de-32-caracteres-minimo");
        assertThatThrownBy(() -> jwt.validar(token)).isInstanceOf(io.jsonwebtoken.JwtException.class);
        ReflectionTestUtils.setField(jwt, "secret", "ticketuki-jwt-secret-key-muy-larga-y-segura-2024-cambiar");
        ReflectionTestUtils.setField(jwt, "expiracionMs", -10000L);
        assertThatThrownBy(() -> jwt.validar(jwt.generarToken(usuario))).isInstanceOf(io.jsonwebtoken.ExpiredJwtException.class);
    }
}
