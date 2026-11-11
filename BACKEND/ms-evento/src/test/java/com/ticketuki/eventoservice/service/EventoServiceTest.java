package com.ticketuki.eventoservice.service;

import com.ticketuki.eventoservice.dto.EventoRequestDTO;
import com.ticketuki.eventoservice.dto.EventoResponseDTO;
import com.ticketuki.eventoservice.exception.EventoNotFoundException;
import com.ticketuki.eventoservice.model.Evento;
import com.ticketuki.eventoservice.repository.EventoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventoServiceTest {

    @Mock
    private EventoRepository eventoRepository;

    @Mock
    private com.ticketuki.eventoservice.client.RecintoEventoClient recintos;

    @InjectMocks
    private EventoService eventoService;

    private Evento eventoEjemplo() {
        return new Evento(1L, "Concierto Rock", 5000,
                LocalDate.of(2026, 9, 20), "Gran show", 1L, 8L, "Los Bunkers");
    }

    // ─────────────1crear exito ─────────────
    @Test
    void crear_conDatosValidos_devuelveDTO() {
        EventoRequestDTO req = new EventoRequestDTO("Concierto Rock", 5000,
                LocalDate.of(2026, 9, 20), "Gran show", 1L, 8L, "Los Bunkers");
        when(eventoRepository.save(any(Evento.class))).thenReturn(eventoEjemplo());

        EventoResponseDTO res = eventoService.crear(req);

        assertThat(res.getId_evento()).isEqualTo(1L);
        assertThat(res.getNombre_evento()).isEqualTo("Concierto Rock");
        assertThat(res.getAforo_evento()).isEqualTo(5000);
        assertThat(res.getParticipantes()).isEqualTo("Los Bunkers");
    }

    // ───────────── 2: obtener inexistente (error) ─────────────
    @Test
    void obtenerPorId_inexistente_lanzaNotFound() {
        when(eventoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventoService.obtenerPorId(99L))
                .isInstanceOf(EventoNotFoundException.class)
                .hasMessage("Evento no encontrado: 99");
    }

    // ─────────────3 cambiar estado exitoso ─────────────
    @Test
    void cambiarEstado_eventoExistente_actualizaEstado() {
        Evento evento = eventoEjemplo();   // estado actual = 1
        when(eventoRepository.findForUpdate(1L)).thenReturn(Optional.of(evento));
        when(eventoRepository.save(any(Evento.class))).thenReturn(evento);

        EventoResponseDTO res = eventoService.cambiarEstado(1L, 3L);

        assertThat(res.getEstado_evento_id_estado()).isEqualTo(3L);
    }

    // ───────────── 4: filtrado por fecha ─────────────
    @Test
    void obtenerPorFecha_devuelveSoloDeEsaFecha() {
        LocalDate fecha = LocalDate.of(2026, 9, 20);
        when(eventoRepository.findByFechaEvento(fecha)).thenReturn(List.of(eventoEjemplo()));

        List<EventoResponseDTO> res = eventoService.obtenerPorFecha(fecha);

        assertThat(res).hasSize(1);
        assertThat(res.get(0).getFecha_evento()).isEqualTo(fecha);
    }

    @Test
    void crear_persisteParticipantesSinServicioArtista() {
        EventoRequestDTO req = new EventoRequestDTO("Festival", 5000,
                LocalDate.of(2027, 1, 10), "Música en vivo", 1L, 8L, "Banda A; Banda B");
        when(eventoRepository.save(any(Evento.class))).thenAnswer(i -> i.getArgument(0));
        EventoResponseDTO res = eventoService.crear(req);
        assertThat(res.getParticipantes()).isEqualTo("Banda A; Banda B");
        assertThat(res.getRecinto_id_recinto()).isEqualTo(8L);
    }

    @Test
    void actualizar_cambiaParticipantesConservandoId() {
        when(eventoRepository.findForUpdate(1L)).thenReturn(Optional.of(eventoEjemplo()));
        when(eventoRepository.save(any(Evento.class))).thenAnswer(i -> i.getArgument(0));
        EventoRequestDTO req = new EventoRequestDTO("Festival", 5000,
                LocalDate.of(2027, 1, 10), null, 1L, 8L, "Compañía de teatro");
        EventoResponseDTO res = eventoService.actualizar(1L, req);
        assertThat(res.getId_evento()).isEqualTo(1L);
        assertThat(res.getParticipantes()).isEqualTo("Compañía de teatro");
    }

    @Test
    void obtenerEventoAntiguo_permiteParticipantesNulos() {
        Evento evento = eventoEjemplo();
        evento.setParticipantes(null);
        when(eventoRepository.findById(1L)).thenReturn(Optional.of(evento));
        assertThat(eventoService.obtenerPorId(1L).getParticipantes()).isNull();
    }
}
