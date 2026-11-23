package com.ticketuki.ticketservice.service;

import com.ticketuki.ticketservice.client.ReferenciasTicketClient;
import com.ticketuki.ticketservice.client.ReferenciasTicketClient.Evento;
import com.ticketuki.ticketservice.client.ReferenciasTicketClient.SectorDetalle;
import com.ticketuki.ticketservice.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;


class DisponibilidadEventoServiceTest {
    private final ReferenciasTicketClient referencias = mock(ReferenciasTicketClient.class);
    private final TicketRepository tickets = mock(TicketRepository.class);
    private final OperacionVentaStore reservas = mock(OperacionVentaStore.class);
    private final DisponibilidadEventoService service = new DisponibilidadEventoService(referencias, tickets, reservas);

    private static Evento evento(long estado, LocalDate fecha) {
        return new Evento(7L, 200, fecha, estado, 1L);
    }

    @BeforeEach void sectores() {
        when(referencias.sectores(7L)).thenReturn(new SectorDetalle[] {
                new SectorDetalle(1L, "Cancha", 100, 45000, 1L, "cancha"),
                new SectorDetalle(2L, "Galería", 100, 20000, 1L, "galeria") });
    }

    @Test void calculaLosCuposRestandoEntradasEmitidasYReservadas() {
        when(referencias.evento(7L)).thenReturn(evento(2, LocalDate.now().plusDays(10)));
        when(tickets.contarSector(7L, 1L)).thenReturn(30L);
        when(reservas.reservadosSector(7L, 1L)).thenReturn(5L);

        var resumen = service.consultar(7L);

        assertThat(resumen.sectores().get(0).disponibles()).isEqualTo(65);
        assertThat(resumen.disponibles()).isEqualTo(165);
        assertThat(resumen.venta_habilitada()).isTrue();
        assertThat(resumen.estado()).isEqualTo("DISPONIBLE");
    }

    @Test void marcaAgotadoElSectorSinCupos() {
        when(referencias.evento(7L)).thenReturn(evento(2, LocalDate.now().plusDays(10)));
        when(tickets.contarSector(7L, 2L)).thenReturn(98L);
        when(reservas.reservadosSector(7L, 2L)).thenReturn(2L);

        var galeria = service.consultar(7L).sectores().get(1);

        assertThat(galeria.disponibles()).isZero();
        assertThat(galeria.estado()).isEqualTo("AGOTADO");
    }

    @Test void noHabilitaLaVentaDeUnEventoAgendado() {
        when(referencias.evento(7L)).thenReturn(evento(1, LocalDate.now().plusDays(10)));

        var resumen = service.consultar(7L);

        assertThat(resumen.venta_habilitada()).isFalse();
        assertThat(resumen.estado()).isEqualTo("NO_DISPONIBLE");
    }
}
