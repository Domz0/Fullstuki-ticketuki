package com.ticketuki.ticketservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketuki.ticketservice.client.ReferenciasTicketClient;
import com.ticketuki.ticketservice.dto.TicketRequestDTO;
import com.ticketuki.ticketservice.repository.TicketRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.*;
import java.time.LocalDate;
import java.util.List;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@DataJpaTest(properties={
        "spring.datasource.url=jdbc:h2:mem:ticketscompra;MODE=MariaDB;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop", "spring.flyway.enabled=false", "audit.enabled=false"})
@AutoConfigureTestDatabase(replace=AutoConfigureTestDatabase.Replace.NONE)
@Import({TicketService.class, TicketsVentaService.class, OperacionVentaStore.class, TicketsVentaIntegrationTest.Config.class})
@Transactional(propagation=Propagation.NOT_SUPPORTED)
class TicketsVentaIntegrationTest {
    @org.springframework.boot.test.context.TestConfiguration static class Config {
        @Bean ObjectMapper mapper() { return new ObjectMapper().findAndRegisterModules(); }
    }
    @Autowired TicketsVentaService service;
    @Autowired TicketService tickets;
    @Autowired TicketRepository repository;
    @Autowired JdbcTemplate jdbc;
    @MockBean ReferenciasTicketClient referencias;

    @BeforeEach void preparar() {
        jdbc.execute("CREATE TABLE IF NOT EXISTS operacion_venta(venta_id BIGINT PRIMARY KEY, estado VARCHAR(20) NOT NULL, solicitud LONGTEXT)");
        jdbc.update("DELETE FROM ticket");
        jdbc.update("DELETE FROM operacion_venta");
        jdbc.update("DELETE FROM cupo_evento");
        when(referencias.evento(1L)).thenReturn(new ReferenciasTicketClient.Evento(1L, 10, LocalDate.now().plusDays(1), 2L, 1L));
        when(referencias.sector(1L)).thenReturn(new ReferenciasTicketClient.Sector(1L,10,1L));
        when(referencias.venta(1L)).thenReturn(new ReferenciasTicketClient.Venta(1L,
                new ReferenciasTicketClient.Estado(2L,"CONFIRMADA"),
                List.of(new ReferenciasTicketClient.Detalle(2,1L,1L))));
    }
    TicketRequestDTO entrada(int asiento) {
        return new TicketRequestDTO(asiento,"Juan","12.345.678-9",1L,1L,1L);
    }

    @Test void emisionRepetidaNoDuplicaTickets() {
        var primera = service.emitir(1L,List.of(entrada(1),entrada(2)));
        var segunda = service.emitir(1L,List.of(entrada(1),entrada(2)));
        assertThat(segunda).extracting("id_ticket").containsExactlyElementsOf(primera.stream().map(t -> t.getId_ticket()).toList());
        assertThat(repository.count()).isEqualTo(2);
    }

    @Test void segundoAsientoInvalidoRevierteTodaLaEmision() {
        assertThatThrownBy(() -> service.emitir(1L,List.of(entrada(1),entrada(1))))
                .isInstanceOf(RuntimeException.class);
        assertThat(repository.count()).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM operacion_venta",Long.class)).isZero();
    }

    @Test void cancelacionRepetidaNoReemiteNiReactiva() {
        service.emitir(1L,List.of(entrada(1),entrada(2)));
        service.cancelar(1L);
        service.cancelar(1L);
        assertThat(repository.findAll()).allMatch(t -> t.getEstado_ticket_id_estado().equals(3L));
        assertThatThrownBy(() -> service.emitir(1L,List.of(entrada(1),entrada(2))))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        assertThatThrownBy(() -> tickets.crearTicket(entrada(3))).isInstanceOf(RuntimeException.class);
        assertThat(repository.count()).isEqualTo(2);
    }

    @Test void ticketUsadoImpideCancelacionSinCancelarLosDemas() {
        var emitidos = service.emitir(1L,List.of(entrada(1),entrada(2)));
        tickets.validarTicket(emitidos.getLast().getCod_qr());
        assertThatThrownBy(() -> service.cancelar(1L)).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        assertThat(repository.findAll()).extracting("estado_ticket_id_estado").containsExactlyInAnyOrder(1L,2L);
    }

    @Test void cancelacionAntesDeEmisionBloqueaSolicitudTardia() {
        service.cancelar(1L);
        assertThatThrownBy(() -> service.emitir(1L,List.of(entrada(1),entrada(2))))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        assertThat(repository.count()).isZero();
    }
}
