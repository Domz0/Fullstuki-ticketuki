package com.ticketuki.gateway.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketuki.common.error.ApiError;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.*;
import reactor.core.publisher.Mono;

@Component
@Order(-2)
public class GatewayErrorHandler implements ErrorWebExceptionHandler {
    private final ObjectMapper mapper;
    public GatewayErrorHandler(ObjectMapper mapper) { this.mapper = mapper; }

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        if (exchange.getResponse().isCommitted()) return Mono.error(ex);
        int status = ex instanceof ResponseStatusException error ? error.getStatusCode().value() : 500;
        String mensaje = switch (status) {
            case 404 -> "Recurso no encontrado";
            case 405 -> "Método no permitido";
            case 400 -> "Solicitud inválida";
            case 503, 502, 504 -> "Servicio no disponible";
            default -> "No se pudo procesar la solicitud";
        };
        exchange.getResponse().setRawStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        try {
            byte[] body = mapper.writeValueAsBytes(ApiError.of(status, mensaje,
                exchange.getRequest().getURI().getPath(), null));
            return exchange.getResponse().writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(body)));
        } catch (Exception serializationError) {
            return Mono.error(serializationError);
        }
    }
}
