package com.ticketuki.gateway.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ResponseStatusException;
import static org.assertj.core.api.Assertions.*;

class GatewayErrorHandlerTest {
    @Test void rutaInexistenteMantieneFormatoDeError() {
        var exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/no-existe"));
        new GatewayErrorHandler(new ObjectMapper().findAndRegisterModules())
            .handle(exchange, new ResponseStatusException(HttpStatus.NOT_FOUND)).block();
        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(exchange.getResponse().getBodyAsString().block()).contains("\"status\":404", "\"path\":\"/no-existe\"");
    }
}
