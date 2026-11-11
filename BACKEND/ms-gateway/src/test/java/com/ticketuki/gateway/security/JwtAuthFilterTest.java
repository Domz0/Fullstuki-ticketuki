package com.ticketuki.gateway.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

class JwtAuthFilterTest {
    JwtUtil jwt = mock(JwtUtil.class);
    AccesoCliente acceso = mock(AccesoCliente.class);
    SesionActivaClient sesiones = mock(SesionActivaClient.class);
    JwtAuthFilter filter = new JwtAuthFilter(jwt, acceso, sesiones, new com.fasterxml.jackson.databind.ObjectMapper().findAndRegisterModules());
    @Test void rutaPrivadaSinTokenDevuelve401() {
        var exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/eventos"));
        var chain = mock(GatewayFilterChain.class);
        filter.filter(exchange, chain).block();
        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        verifyNoInteractions(chain);
    }
    @Test void clienteNoPuedeCrearEvento() {
        var claims = mock(Claims.class);
        when(jwt.validarYObtenerClaims("token")).thenReturn(claims);
        when(claims.get("rol")).thenReturn("CLIENTE");
        var exchange = MockServerWebExchange.from(MockServerHttpRequest.post("/eventos").header("Authorization", "Bearer token"));
        var chain = mock(GatewayFilterChain.class);
        filter.filter(exchange, chain).block();
        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verifyNoInteractions(chain);
    }
    @Test void registroPublicoEliminaCabecerasSuplantadas() {
        var exchange = MockServerWebExchange.from(MockServerHttpRequest.post("/auth/registro")
            .header("X-Rol", "ADMIN").header("X-Usuario-Id", "1").header("X-Internal-Key", "secreto"));
        filter.filter(exchange, destino -> {
            assertThat(destino.getRequest().getHeaders().getFirst("X-Rol")).isNull();
            assertThat(destino.getRequest().getHeaders().getFirst("X-Usuario-Id")).isNull();
            assertThat(destino.getRequest().getHeaders().getFirst("X-Internal-Key")).isNull();
            return Mono.empty();
        }).block();
        verifyNoInteractions(jwt);
    }

    @Test void tokenRevocadoNoLlegaAlServicioYDevuelveErrorJson() {
        var claims = mock(Claims.class);
        when(jwt.validarYObtenerClaims("token")).thenReturn(claims);
        when(claims.get("rol")).thenReturn("ADMIN");
        when(claims.getSubject()).thenReturn("admin");
        when(sesiones.validar("Bearer token")).thenReturn(Mono.just(false));
        var exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/eventos").header("Authorization", "Bearer token"));
        var chain = mock(GatewayFilterChain.class);
        filter.filter(exchange, chain).block();
        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(exchange.getResponse().getBodyAsString().block()).contains("\"status\":401", "\"path\":\"/eventos\"");
        verifyNoInteractions(chain);
    }

    @Test void caidaDeAuthImpideAccesoInclusoAdmin() {
        var claims = mock(Claims.class);
        when(jwt.validarYObtenerClaims("token")).thenReturn(claims);
        when(claims.get("rol")).thenReturn("ADMIN");
        when(claims.getSubject()).thenReturn("admin");
        when(sesiones.validar("Bearer token")).thenReturn(Mono.error(new IllegalStateException()));
        var exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/eventos").header("Authorization", "Bearer token"));
        var chain = mock(GatewayFilterChain.class);
        filter.filter(exchange, chain).block();
        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        verifyNoInteractions(chain);
    }
}
