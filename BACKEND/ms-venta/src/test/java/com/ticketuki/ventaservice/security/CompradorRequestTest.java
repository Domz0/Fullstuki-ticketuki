package com.ticketuki.ventaservice.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;
import static org.assertj.core.api.Assertions.*;

class CompradorRequestTest {
    @Test void clienteNoPuedeComprarParaOtroUsuario() {
        var request = new MockHttpServletRequest();
        request.addHeader("X-Rol", "CLIENTE");
        request.addHeader("X-Usuario-Id", "3");
        assertThatThrownBy(() -> CompradorRequest.validar(request, 4L)).isInstanceOf(ResponseStatusException.class);
        assertThatCode(() -> CompradorRequest.validar(request, 3L)).doesNotThrowAnyException();
    }
    @Test void identidadAusenteNoAutorizaCompra() {
        assertThatThrownBy(() -> CompradorRequest.validar(new MockHttpServletRequest(), 3L))
            .isInstanceOf(ResponseStatusException.class);
    }
}
