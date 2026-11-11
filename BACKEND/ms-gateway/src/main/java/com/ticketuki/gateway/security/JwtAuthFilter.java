package com.ticketuki.gateway.security;

import io.jsonwebtoken.Claims;
import org.springframework.cloud.gateway.filter.*;
import org.springframework.core.Ordered;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {
    private final JwtUtil jwtUtil;
    private final AccesoCliente accesoCliente;
    private final SesionActivaClient sesiones;
    private final com.fasterxml.jackson.databind.ObjectMapper mapper;

    public JwtAuthFilter(JwtUtil jwtUtil, AccesoCliente accesoCliente, SesionActivaClient sesiones, com.fasterxml.jackson.databind.ObjectMapper mapper) {
        this.jwtUtil = jwtUtil;
        this.accesoCliente = accesoCliente;
        this.sesiones = sesiones;
        this.mapper = mapper;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        var request = exchange.getRequest().mutate().headers(headers -> {
            headers.remove("X-Usuario");
            headers.remove("X-Usuario-Id");
            headers.remove("X-Rol");
            headers.remove("X-Auth-Id");
            headers.remove("X-Internal-Key");
        }).build();
        var limpia = exchange.mutate().request(request).build();
        if (PoliticaRoles.publica(path, request.getMethod())) return chain.filter(limpia);
        String header = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) return rechazar(exchange, HttpStatus.UNAUTHORIZED);
        Claims claims;
        try {
            claims = jwtUtil.validarYObtenerClaims(header.substring(7));
        } catch (Exception ex) {
            return rechazar(exchange, HttpStatus.UNAUTHORIZED);
        }
        String rol = claims.get("rol") instanceof String valor ? valor : null;
        if (!PoliticaRoles.permite(rol, path, request.getMethod())) return rechazar(exchange, HttpStatus.FORBIDDEN);
        Long usuarioId = claims.get("usuarioId") instanceof Number n ? n.longValue() : null;
        if (claims.getSubject() == null || claims.getSubject().isBlank()) return rechazar(exchange, HttpStatus.UNAUTHORIZED);
        var autenticada = request.mutate().headers(headers -> {
            headers.set("X-Usuario", claims.getSubject());
            headers.set("X-Rol", rol);
            if (usuarioId != null) headers.set("X-Usuario-Id", usuarioId.toString());
            if (claims.get("id") instanceof Number id) headers.set("X-Auth-Id", id.toString());
        }).build();
        var destino = exchange.mutate().request(autenticada).build();
        return sesiones.validar(header)
                .onErrorResume(ex -> rechazar(exchange, HttpStatus.SERVICE_UNAVAILABLE).thenReturn(false))
                .flatMap(activa -> {
                    if (exchange.getResponse().isCommitted()) return Mono.empty();
                    if (!activa) return rechazar(exchange, HttpStatus.UNAUTHORIZED);
                    if (!"CLIENTE".equals(rol)) return chain.filter(destino);
                    return accesoCliente.permite(path, usuarioId)
                        .onErrorResume(ex -> rechazar(exchange, HttpStatus.SERVICE_UNAVAILABLE).thenReturn(false))
                        .flatMap(permitido -> permitido ? chain.filter(destino)
                            : exchange.getResponse().isCommitted() ? Mono.empty() : rechazar(exchange, HttpStatus.FORBIDDEN));
                });
    }

    private Mono<Void> rechazar(ServerWebExchange exchange, HttpStatus status) {
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String mensaje = switch (status) {
            case UNAUTHORIZED -> "Sesión inválida o vencida";
            case FORBIDDEN -> "No tienes permiso para esta operación";
            default -> "No se pudo verificar el acceso";
        };
        try {
            byte[] body = mapper.writeValueAsBytes(com.ticketuki.common.error.ApiError.of(
                status.value(), mensaje, exchange.getRequest().getURI().getPath(), null));
            return exchange.getResponse().writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(body)));
        } catch (Exception ex) {
            return exchange.getResponse().setComplete();
        }
    }

    @Override public int getOrder() { return -1; }
}
