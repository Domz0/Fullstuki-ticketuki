package com.ticketuki.gateway.security;

import org.junit.jupiter.api.Test;
import org.springframework.http.*;
import org.springframework.web.reactive.function.client.*;
import reactor.core.publisher.Mono;
import java.util.concurrent.atomic.AtomicReference;
import static org.assertj.core.api.Assertions.*;

class AccesoClienteTest {
    private AccesoCliente acceso(String body, HttpStatus status, AtomicReference<ClientRequest> request) {
        var builder = WebClient.builder().defaultHeader("X-Internal-Key", "privilegiada")
                .exchangeFunction(r -> {
                    request.set(r);
                    return Mono.just(ClientResponse.create(status).header("Content-Type", "application/json").body(body).build());
                });
        return new AccesoCliente(builder, "http://usuarios", "http://ventas", "http://tickets");
    }

    @Test void perfilAjenoYListadosNoSePermiten() {
        var a = acceso("{}", HttpStatus.OK, new AtomicReference<>());
        assertThat(a.permite("/usuarios/2", 1L).block()).isFalse();
        assertThat(a.permite("/usuarios/1", 1L).block()).isTrue();
        assertThat(PoliticaRoles.permite("CLIENTE", "/usuarios", HttpMethod.GET)).isFalse();
        assertThat(PoliticaRoles.permite("CLIENTE", "/historial", HttpMethod.GET)).isFalse();
    }

    @Test void ventaDebePertenecerCompletamenteAlUsuario() {
        var request = new AtomicReference<ClientRequest>();
        var a = acceso("{\"detalles\":[{\"usuario_id_usuario\":1},{\"usuario_id_usuario\":2}]}", HttpStatus.OK, request);
        assertThat(a.permite("/ventas/10", 1L).block()).isFalse();
        a = acceso("{\"detalles\":[{\"usuario_id_usuario\":1}]}", HttpStatus.OK, request);
        assertThat(a.permite("/ventas/10", 1L).block()).isTrue();
    }

    @Test void pagosYComprasAjenosSeRechazan() {
        var a = acceso("{\"usuario_id\":2}", HttpStatus.OK, new AtomicReference<>());
        for (var path : java.util.List.of("/pagos/7", "/pagos/7/cancelar", "/compras/8"))
            assertThat(a.permite(path, 1L).block()).isFalse();
    }

    @Test void recursoInexistenteNoConcedeAcceso() {
        for (var status : java.util.List.of(HttpStatus.NOT_FOUND)) {
            var a = acceso("{}", status, new AtomicReference<>());
            assertThat(a.permite("/ventas/10", 1L).block()).isFalse();
        }
    }

    @Test void titularNoAceptaOtro() {
        var a = acceso("{\"run\":\"12.345.678-K\"}", HttpStatus.OK, new AtomicReference<>());
        assertThat(a.permite("/tickets/titular/12.345.678-k", 1L).block()).isTrue();
        assertThat(a.permite("/tickets/titular/11111111-1", 1L).block()).isFalse();
    }
}
