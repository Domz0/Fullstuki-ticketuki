package com.ticketuki.common.audit;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.client.RestClient;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.http.HttpStatus;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class AuditoriaPublisherTest {
    @Test void fallaYReintentaElMismoEventoAntesDeMarcarEnviado() {
        var jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForList(anyString())).thenReturn(List.of(Map.of("id", "evento-unico", "payload", "{}")));
        var builder = RestClient.builder().baseUrl("http://historial");
        var server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo("http://historial/interno/historial")).andExpect(header("X-Internal-Key", "interna"))
            .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));
        var publisher = new AuditoriaPublisher(jdbc, builder.build(), "interna");
        publisher.enviarPendientes();
        verify(jdbc, never()).update(anyString(), any(Object.class));
        server.verify();
        server.reset();
        server.expect(requestTo("http://historial/interno/historial")).andRespond(withSuccess());
        publisher.enviarPendientes();
        verify(jdbc).update("UPDATE auditoria_pendiente SET enviado = CURRENT_TIMESTAMP WHERE id = ?", "evento-unico");
        server.verify();
    }
}
