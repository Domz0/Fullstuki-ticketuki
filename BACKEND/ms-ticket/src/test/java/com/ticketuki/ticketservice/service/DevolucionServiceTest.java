package com.ticketuki.ticketservice.service;

import com.ticketuki.common.security.AccesoServicio;
import com.ticketuki.ticketservice.client.ReferenciasTicketClient;
import com.ticketuki.ticketservice.client.ReferenciasTicketClient.Estado;
import com.ticketuki.ticketservice.client.ReferenciasTicketClient.Evento;
import com.ticketuki.ticketservice.client.ReferenciasTicketClient.Venta;
import com.ticketuki.ticketservice.model.EstadoTicket;
import com.ticketuki.ticketservice.model.Ticket;
import com.ticketuki.ticketservice.repository.TicketRepository;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

// Reglas para que un cliente devuelva una entrada
class DevolucionServiceTest {
    private final TicketRepository tickets = mock(TicketRepository.class);
    private final ReferenciasTicketClient referencias = mock(ReferenciasTicketClient.class);
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final DevolucionService service =
            new DevolucionService(tickets, referencias, mock(AccesoServicio.class), jdbc);

    private Ticket entrada(EstadoTicket estado) {
        var ticket = new Ticket();
        ticket.setId_ticket(21L);
        ticket.setRun_titular("12.345.678-5");
        ticket.setEstado(estado);
        ticket.setEvento_id_evento(7L);
        ticket.setVenta_id_venta(55L);
        when(tickets.findByIdForUpdate(21L)).thenReturn(Optional.of(ticket));
        return ticket;
    }

    private void eventoYVenta(long estadoEvento, LocalDate fecha, String estadoVenta) {
        when(referencias.evento(7L)).thenReturn(new Evento(7L, 200, fecha, estadoEvento, 1L));
        when(referencias.venta(55L)).thenReturn(new Venta(55L, new Estado(1L, estadoVenta), List.of()));
    }

    @Test void devuelveUnaEntradaValidaYLiberaElCupo() {
        var ticket = entrada(EstadoTicket.VALIDO);
        eventoYVenta(2, LocalDate.now().plusDays(10), "CONFIRMADA");

        service.solicitar(21L);

        assertThat(ticket.getEstado()).isEqualTo(EstadoTicket.CANCELADO);
        verify(tickets).saveAndFlush(ticket);
        verify(jdbc).update("INSERT INTO devolucion_pendiente(ticket_id) VALUES (?)", 21L);
    }

    @Test void noDevuelveUnaEntradaYaUsada() {
        entrada(EstadoTicket.USADO);

        assertThatThrownBy(() -> service.solicitar(21L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("La entrada ya fue usada o cancelada");
        verify(tickets, never()).saveAndFlush(any());
    }

    @Test void noDevuelveEntradasDeUnEventoFinalizado() {
        entrada(EstadoTicket.VALIDO);
        eventoYVenta(4, LocalDate.now().plusDays(10), "CONFIRMADA");

        assertThatThrownBy(() -> service.solicitar(21L))
                .hasMessage("No puedes devolver entradas de eventos concluidos");
        verify(tickets, never()).saveAndFlush(any());
    }
}
