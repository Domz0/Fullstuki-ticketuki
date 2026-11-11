package com.ticketuki.gateway.security;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.*;
import reactor.core.publisher.Mono;
import static org.assertj.core.api.Assertions.*;

class SesionActivaClientTest {
    SesionActivaClient client(HttpStatus status) {
        return new SesionActivaClient(WebClient.builder().exchangeFunction(request -> {
            assertThat(request.headers().getFirst("X-Internal-Key")).isEqualTo("interna");
            assertThat(request.headers().getFirst("Authorization")).isEqualTo("Bearer token");
            return Mono.just(ClientResponse.create(status).build());
        }), "http://auth", "interna");
    }
    @Test void aceptaSesionVigenteYRechazaRevocada() {
        assertThat(client(HttpStatus.OK).validar("Bearer token").block()).isTrue();
        assertThat(client(HttpStatus.UNAUTHORIZED).validar("Bearer token").block()).isFalse();
    }
    @Test void servicioCaidoNoAutoriza() {
        assertThatThrownBy(() -> client(HttpStatus.SERVICE_UNAVAILABLE).validar("Bearer token").block())
            .isInstanceOf(WebClientResponseException.class);
    }
}
