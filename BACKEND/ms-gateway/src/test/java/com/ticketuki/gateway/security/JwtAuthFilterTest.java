package com.ticketuki.gateway.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.test.util.ReflectionTestUtils;
import reactor.core.publisher.Mono;
import java.util.Date;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtAuthFilterTest {
    @Test void identidadFirmadaReemplazaCabecerasFalsificadas() {
        var jwt = new JwtUtil();
        ReflectionTestUtils.setField(jwt, "secret", "ticketuki-jwt-secret-key-muy-larga-y-segura-2024-cambiar");
        var token = Jwts.builder().subject("cliente").claim("id", 10L).claim("usuarioId", 1L)
                .claim("rol", "CLIENTE").expiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(Keys.hmacShaKeyFor("ticketuki-jwt-secret-key-muy-larga-y-segura-2024-cambiar".getBytes(StandardCharsets.UTF_8))).compact();
        String header = "Bearer " + token;
        var permisos = mock(AccesoCliente.class);
        var sesiones = mock(SesionActivaClient.class);
        when(sesiones.validar(header)).thenReturn(Mono.just(true));
        when(permisos.permite("/usuarios/1", 1L)).thenReturn(Mono.just(true));
        var filter = new JwtAuthFilter(jwt, permisos, sesiones, new ObjectMapper());
        var exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/usuarios/1")
                .header("Authorization", header).header("X-Usuario-Id", "2")
                .header("X-Rol", "ADMIN").header("X-Internal-Key", "falsa"));
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenAnswer(inv -> {
            org.springframework.web.server.ServerWebExchange forwarded = inv.getArgument(0);
            assertThat(forwarded.getRequest().getHeaders().getFirst("X-Usuario-Id")).isEqualTo("1");
            assertThat(forwarded.getRequest().getHeaders().getFirst("X-Rol")).isEqualTo("CLIENTE");
            assertThat(forwarded.getRequest().getHeaders().containsKey("X-Internal-Key")).isFalse();
            return Mono.empty();
        });
        filter.filter(exchange, chain).block();
        verify(chain).filter(any());
        when(permisos.permite("/usuarios/1", 1L)).thenReturn(Mono.just(false));
        var rejected = MockServerWebExchange.from(MockServerHttpRequest.get("/usuarios/1").header("Authorization", header));
        clearInvocations(chain);
        filter.filter(rejected, chain).block();
        assertThat(rejected.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verifyNoInteractions(chain);
    }

    @Test void sinTokenOConTokenInvalidoNoEnruta() {
        var jwt = new JwtUtil();
        ReflectionTestUtils.setField(jwt, "secret", "ticketuki-jwt-secret-key-muy-larga-y-segura-2024-cambiar");
        var filter = new JwtAuthFilter(jwt, mock(AccesoCliente.class), mock(SesionActivaClient.class), new ObjectMapper());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        for (String token : java.util.List.of("", "Bearer invalido")) {
            var ex = MockServerWebExchange.from(MockServerHttpRequest.get("/usuarios/1").header("Authorization", token));
            filter.filter(ex, chain).block();
            assertThat(ex.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
        verifyNoInteractions(chain);
    }
}
