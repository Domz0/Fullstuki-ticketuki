package com.ticketuki.authservice.security;

import com.ticketuki.authservice.model.Rol;
import com.ticketuki.authservice.model.UsuarioAuth;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.*;

class JwtUtilTest {
    private static final String SECRET = "clave-solo-para-pruebas-unitarias-de-ticketuki-2026";
    private final JwtUtil jwt = new JwtUtil();
    private final UsuarioAuth usuario = new UsuarioAuth(4L, "cliente", "clave-no-exponer", Rol.CLIENTE, 81L);

    @BeforeEach
    void preparar() {
        ReflectionTestUtils.setField(jwt, "secret", SECRET);
        ReflectionTestUtils.setField(jwt, "expiracionMs", 3600000L);
    }

    @Test
    void firmaClaimsCompatiblesConGatewaySinPassword() {
        var claims = Jwts.parser().verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .build().parseSignedClaims(jwt.generarToken(usuario)).getPayload();
        assertThat(claims.getSubject()).isEqualTo("cliente");
        assertThat(claims.get("id", Long.class)).isEqualTo(4L);
        assertThat(claims.get("usuarioId", Long.class)).isEqualTo(81L);
        assertThat(claims.get("rol", String.class)).isEqualTo("CLIENTE");
        assertThat(claims).doesNotContainKeys("password");
        assertThat(claims.getExpiration().getTime() - claims.getIssuedAt().getTime()).isEqualTo(3600000L);
    }

    @Test
    void noInventaVinculoParaCuentaLegacy() {
        usuario.setUsuarioId(null);
        var claims = Jwts.parser().verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .build().parseSignedClaims(jwt.generarToken(usuario)).getPayload();
        assertThat(claims).doesNotContainKey("usuarioId");
    }

    @Test
    void tokenExpiradoEsRechazado() {
        ReflectionTestUtils.setField(jwt, "expiracionMs", -10000L);
        String token = jwt.generarToken(usuario);
        assertThatThrownBy(() -> Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .build().parseSignedClaims(token)).isInstanceOf(ExpiredJwtException.class);
    }

    @Test
    void otraClaveNoPuedeValidarlo() {
        String token = jwt.generarToken(usuario);
        assertThatThrownBy(() -> Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor("otra-clave-distinta-de-prueba-con-longitud-suficiente".getBytes(StandardCharsets.UTF_8)))
                .build().parseSignedClaims(token)).isInstanceOf(SignatureException.class);
    }
}
