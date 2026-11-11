package com.ticketuki.ticketservice.service;

import com.ticketuki.ticketservice.dto.*;
import com.ticketuki.ticketservice.exception.TicketOperacionInvalidaException;
import com.ticketuki.ticketservice.model.Ticket;
import com.ticketuki.ticketservice.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class TicketLifecycleTest {
    private final TicketRepository repository = mock(TicketRepository.class);
    private TicketService service;
    private Ticket ticket;
    private static final String ESTADOS = """
        [{"id":9,"nombre":"INVALIDO"},{"id":1,"nombre":"VALIDO"},
         {"id":2,"nombre":"USADO"},{"id":3,"nombre":"CANCELADO"},
         {"id":4,"nombre":"TRANSFERIDO"}]
        """;

    private WebClient client(HttpStatus status, String body) {
        return WebClient.builder().exchangeFunction(request -> Mono.just(ClientResponse.create(status)
                .header("Content-Type", "application/json").body(body).build())).build();
    }

    @BeforeEach
    void preparar() {
        WebClient referencia = client(HttpStatus.OK, "{}");
        service = new TicketService(repository, client(HttpStatus.OK, ESTADOS), referencia, referencia, referencia);
        ticket = new Ticket(1L, "QRANTIGUO1", 1, "Juan", "12.345.678-9",
                LocalDate.now(), 1L, 1L, 1L, 1L);
    }

    private TicketRequestDTO request() {
        return new TicketRequestDTO(1, "Juan", "12345678-9", 1L, 1L, 1L);
    }

    @Test
    void crearUsaEstadoValidoExactoYNormalizaRun() {
        when(repository.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));
        var response = service.crearTicket(request());
        assertThat(response.getEstado_ticket_id_estado()).isEqualTo(1L);
        assertThat(response.getRun_titular()).isEqualTo("12.345.678-9");
    }

    @Test
    void crearNoPersisteCuandoFallaServicioEstados() {
        WebClient referencia = client(HttpStatus.OK, "{}");
        service = new TicketService(repository, client(HttpStatus.SERVICE_UNAVAILABLE, "{}"), referencia, referencia, referencia);
        assertThatThrownBy(() -> service.crearTicket(request()))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        ex -> assertThat(ex.getStatusCode().value()).isEqualTo(503));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void crearNoPersisteSiFaltaValido() {
        WebClient referencia = client(HttpStatus.OK, "{}");
        service = new TicketService(repository, client(HttpStatus.OK, "[{\"id\":9,\"nombre\":\"INVALIDO\"}]"), referencia, referencia, referencia);
        assertThatThrownBy(() -> service.crearTicket(request())).isInstanceOf(ResponseStatusException.class);
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void conflictoDeAsientoNoReintentaTransaccion() {
        when(repository.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException("unique"));
        assertThatThrownBy(() -> service.crearTicket(request())).isInstanceOf(DataIntegrityViolationException.class);
        verify(repository, times(1)).saveAndFlush(any());
    }

    @Test
    void invalidoNoSeAceptaComoValido() {
        ticket.setEstado_ticket_id_estado(9L);
        when(repository.findByQrForUpdate(ticket.getCod_qr())).thenReturn(Optional.of(ticket));
        assertThat(service.validarTicket(ticket.getCod_qr()).isValido()).isFalse();
        verify(repository, never()).save(any());
    }

    @Test
    void transferidoSePuedeUsarUnaSolaVez() {
        ticket.setEstado_ticket_id_estado(4L);
        when(repository.findByQrForUpdate(ticket.getCod_qr())).thenReturn(Optional.of(ticket));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));
        assertThat(service.validarTicket(ticket.getCod_qr()).isValido()).isTrue();
        assertThat(ticket.getEstado_ticket_id_estado()).isEqualTo(2L);
        assertThat(service.validarTicket(ticket.getCod_qr()).isValido()).isFalse();
        verify(repository, times(1)).save(any());
    }

    @Test
    void transferenciaCambiaQrYTitular() {
        when(repository.findByIdForUpdate(1L)).thenReturn(Optional.of(ticket));
        when(repository.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));
        var response = service.transferirTicket(1L, new TransferirTicketDTO("Ana", "11111111-k"));
        assertThat(response.getCod_qr()).isNotEqualTo("QRANTIGUO1");
        assertThat(response.getRun_titular()).isEqualTo("11.111.111-K");
        assertThat(response.getEstado_ticket_id_estado()).isEqualTo(4L);
    }

    @Test
    void noTransfiereAlMismoTitular() {
        when(repository.findByIdForUpdate(1L)).thenReturn(Optional.of(ticket));
        assertThatThrownBy(() -> service.transferirTicket(1L, new TransferirTicketDTO("Juan", "12345678-9")))
                .isInstanceOf(TicketOperacionInvalidaException.class);
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void noEditaEstadoDesconocido() {
        ticket.setEstado_ticket_id_estado(null);
        when(repository.findByIdForUpdate(1L)).thenReturn(Optional.of(ticket));
        assertThatThrownBy(() -> service.actualizarTicket(1L, new TicketUpdateDTO("Juan", "12345678-9")))
                .isInstanceOf(TicketOperacionInvalidaException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void noCambiaTitularMedianteEdicion() {
        when(repository.findByIdForUpdate(1L)).thenReturn(Optional.of(ticket));
        assertThatThrownBy(() -> service.actualizarTicket(1L, new TicketUpdateDTO("Ana", "11111111-k")))
                .isInstanceOf(TicketOperacionInvalidaException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void noReactivaTicketUsado() {
        ticket.setEstado_ticket_id_estado(2L);
        when(repository.findByIdForUpdate(1L)).thenReturn(Optional.of(ticket));
        assertThatThrownBy(() -> service.cambiarEstado(1L, 1L)).isInstanceOf(TicketOperacionInvalidaException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void noSimulaTransferenciaCambiandoSoloEstado() {
        when(repository.findByIdForUpdate(1L)).thenReturn(Optional.of(ticket));
        assertThatThrownBy(() -> service.cambiarEstado(1L, 4L)).isInstanceOf(TicketOperacionInvalidaException.class);
        verify(repository, never()).save(any());
    }
}
