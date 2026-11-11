package com.ticketuki.gateway.security;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.*;
import reactor.core.publisher.Mono;
import static org.assertj.core.api.Assertions.*;

class AccesoClienteTest {
    AccesoCliente acceso(String body, HttpStatus status) {
        return new AccesoCliente(WebClient.builder().exchangeFunction(r -> Mono.just(
            ClientResponse.create(status).header("Content-Type", "application/json").body(body).build())),
            "http://usuarios", "http://ventas", "http://tickets");
    }
    @Test void perfilDebeCoincidirConJwt() {
        var acceso = acceso("{}", HttpStatus.OK);
        assertThat(acceso.permite("/usuarios/2", 1L).block()).isFalse();
        assertThat(acceso.permite("/usuarios/1", 1L).block()).isTrue();
        assertThat(acceso.permite("/usuarios/1", null).block()).isFalse();
    }
    @Test void ventaDebePertenecerEnteramenteAlComprador() {
        assertThat(acceso("{\"detalles\":[{\"usuario_id_usuario\":1}]}", HttpStatus.OK)
            .permite("/ventas/3", 1L).block()).isTrue();
        assertThat(acceso("{\"detalles\":[{\"usuario_id_usuario\":1},{\"usuario_id_usuario\":2}]}", HttpStatus.OK)
            .permite("/ventas/3", 1L).block()).isFalse();
        assertThat(acceso("{\"detalles\":[]}", HttpStatus.OK).permite("/ventas/3", 1L).block()).isFalse();
    }
    @Test void pagoAjenoOInexistenteNoEsAccesible() {
        assertThat(acceso("{\"usuario_id\":2}", HttpStatus.OK).permite("/pagos/3/cancelar", 1L).block()).isFalse();
        assertThat(acceso("{}", HttpStatus.NOT_FOUND).permite("/pagos/3", 1L).block()).isFalse();
    }
    @Test void errorRemotoNoAutoriza() {
        assertThatThrownBy(() -> acceso("{}", HttpStatus.SERVICE_UNAVAILABLE).permite("/ventas/3", 1L).block())
            .isInstanceOf(WebClientResponseException.class);
    }
}
