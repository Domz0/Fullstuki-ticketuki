package com.ticketuki.authservice.security;

import com.ticketuki.authservice.model.UsuarioAuth;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    // La clave secreta y la expiración se externalizan en application.properties.
    // El secret DEBE ser idéntico al del ms-gateway para que éste pueda validar el token.
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expiracionMs;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public long getExpiracionMs() {
        return expiracionMs;
    }

    // Genera un JWT firmado con los datos del usuario (subject = username, claim rol).
    public String generarToken(UsuarioAuth usuario) {
        Date ahora = new Date();
        Date vencimiento = new Date(ahora.getTime() + expiracionMs);

        return Jwts.builder()
                .subject(usuario.getUsername())
                .claim("id", usuario.getId_usuario_auth())
                .claim("rol", usuario.getRol().name())
                .claim("usuarioId", usuario.getUsuarioId())
                .issuedAt(ahora)
                .expiration(vencimiento)
                .signWith(getKey())
                .compact();
    }
}
