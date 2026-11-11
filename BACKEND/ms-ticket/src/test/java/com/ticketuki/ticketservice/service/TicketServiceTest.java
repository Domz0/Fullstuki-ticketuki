package com.ticketuki.ticketservice.service;

import com.ticketuki.ticketservice.dto.TicketResponseDTO;
import com.ticketuki.ticketservice.exception.TicketNotFoundException;
import com.ticketuki.ticketservice.model.Ticket;
import com.ticketuki.ticketservice.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    private TicketService ticketService;

    @BeforeEach
    void setUp() {
        // metodos probados solo usan el repositorio - WebClients en null
        ticketService = new TicketService(ticketRepository, null, null, null);
    }

    private Ticket ticketEjemplo() {
        return new Ticket(1L, "QR-ABC-123", 42, "Juan Pérez", "12.345.678-9",
                LocalDate.of(2026, 9, 20), 100L, 1L, 3L, 7L);
    }

    // ───────1: obtener ticket inexistente (error) ───────
    @Test
    void obtenerTicket_inexistente_lanzaNotFound() {
        when(ticketRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.obtenerTicket(99L))
                .isInstanceOf(TicketNotFoundException.class)
                .hasMessage("Ticket no encontrado: 99");
    }

    // ──────2: obtener por QR existente ( es optional con valor) ───────
    @Test
    void obtenerPorQR_existente_devuelveOptionalConValor() {
        when(ticketRepository.findByCod_qr("QR-ABC-123")).thenReturn(Optional.of(ticketEjemplo()));

        Optional<TicketResponseDTO> res = ticketService.obtenerPorQR("QR-ABC-123");

        assertThat(res).isPresent();
        assertThat(res.get().getCod_qr()).isEqualTo("QR-ABC-123");
    }

    // ──────3: obtener por QR inexistente (caso borde sin excepcion...) ───────
    @Test
    void obtenerPorQR_inexistente_devuelveOptionalVacio() {
        when(ticketRepository.findByCod_qr("NO-EXISTE")).thenReturn(Optional.empty());

        Optional<TicketResponseDTO> res = ticketService.obtenerPorQR("NO-EXISTE");

        assertThat(res).isEmpty();
    }

    // ───────4 validar ticket con QR inexistente (error) ───────
    @Test
    void validarTicket_qrInexistente_lanzaNotFound() {
        when(ticketRepository.findByQrForUpdate("QR-FALSO")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.validarTicket("QR-FALSO"))
                .isInstanceOf(TicketNotFoundException.class)
                .hasMessage("Ticket no encontrado para QR: QR-FALSO");
    }

    // ─────── 5 : listar por evento (filtrado) ───────
    @Test
    void listarPorEvento_devuelveSoloDelEvento() {
        when(ticketRepository.findByEvento_id_evento(3L)).thenReturn(List.of(ticketEjemplo()));

        List<TicketResponseDTO> res = ticketService.listarPorEvento(3L);

        assertThat(res).hasSize(1);
        assertThat(res.get(0).getEvento_id_evento()).isEqualTo(3L);
    }
}
