package com.ticketuki.common.security;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.*;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.*;
import org.springframework.web.server.ResponseStatusException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import static org.assertj.core.api.Assertions.*;

class AccesoServicioTest {
    private HttpServer server;
    private AccesoServicio acceso;
    private MockHttpServletRequest request;
    @BeforeEach void preparar() throws Exception {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/auth/me", exchange -> {
            byte[] body = "{\"authId\":10,\"username\":\"cliente\",\"rol\":\"CLIENTE\",\"usuarioId\":1,\"activo\":true}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            try (var out = exchange.getResponseBody()) { out.write(body); }
        });
        server.start();
        String url = "http://127.0.0.1:" + server.getAddress().getPort();
        acceso = new AccesoServicio(url, url, "interna-test");
        request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }
    @AfterEach void cerrar() { RequestContextHolder.resetRequestAttributes(); server.stop(0); }

    @Test void propietarioRealPuedeAccederYNoPuedeSuplantarOtro() {
        request.addHeader("Authorization", "Bearer valido");
        request.addHeader("X-Usuario-Id", "2");
        request.addHeader("X-Rol", "ADMIN");
        assertThatCode(() -> acceso.propietario(1L)).doesNotThrowAnyException();
        assertThatThrownBy(() -> acceso.propietario(2L)).isInstanceOfSatisfying(ResponseStatusException.class,
                ex -> assertThat(ex.getStatusCode().value()).isEqualTo(403));
        assertThatThrownBy(acceso::administrador).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> acceso.propietarios(java.util.List.of(1L, 2L))).isInstanceOf(ResponseStatusException.class);
    }

    @Test void cabecerasSinTokenNoAutentican() {
        request.addHeader("X-Rol", "ADMIN");
        assertThatThrownBy(() -> acceso.propietario(1L)).isInstanceOfSatisfying(ResponseStatusException.class,
                ex -> assertThat(ex.getStatusCode().value()).isEqualTo(401));
    }

    @Test void claveInternaIncorrectaNoDaPrivilegios() {
        request.addHeader("X-Internal-Key", "falsa");
        assertThatThrownBy(acceso::administrador).isInstanceOfSatisfying(ResponseStatusException.class,
                ex -> assertThat(ex.getStatusCode().value()).isEqualTo(401));
    }
}
