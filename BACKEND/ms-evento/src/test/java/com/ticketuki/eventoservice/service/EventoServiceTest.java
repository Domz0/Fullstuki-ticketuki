package com.ticketuki.eventoservice.service;

import com.ticketuki.common.security.AccesoServicio;
import com.ticketuki.common.validation.ValidacionDatos;
import com.ticketuki.eventoservice.client.RecintoEventoClient;
import com.ticketuki.eventoservice.dto.EventoRequestDTO;
import com.ticketuki.eventoservice.model.Evento;
import com.ticketuki.eventoservice.repository.EventoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;


class EventoServiceTest {
    private final AccesoServicio acceso = mock(AccesoServicio.class);
    private final EventoRepository eventos = mock(EventoRepository.class);
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final EventoService service = new EventoService(mock(ValidacionDatos.class), acceso, eventos,
            mock(SectoresEventoService.class), mock(RecintoEventoClient.class), jdbc);

    private static EventoRequestDTO datos(LocalDate fecha, long recinto) {
        var dto = new EventoRequestDTO();
        dto.setNombre_evento("Concierto de tukis");
        dto.setFecha_evento(fecha);
        dto.setEstado_evento_id_estado(2L);
        dto.setRecinto_id_recinto(recinto);
        return dto;
    }

    private void existe(long estado, long recinto) {
        var evento = new Evento(7L, "Concierto", 300, LocalDate.now().plusDays(30), "", estado, recinto, null);
        when(eventos.findForUpdate(7L)).thenReturn(Optional.of(evento));
    }

    @Test void noCreaUnEventoConFechaPasada() {
        assertThatThrownBy(() -> service.crear(datos(LocalDate.now().minusDays(1), 1)))
                .hasMessage("No puedes crear un evento con fecha pasada");
        verify(eventos, never()).saveAndFlush(any());
    }

    @Test void soloDestacaEventosDisponibles() {
        existe(1, 1);

        assertThatThrownBy(() -> service.destacar(7L))
                .hasMessage("El destacado debe ser un evento disponible y vigente");
        verify(jdbc, never()).update(anyString(), any(Object[].class));
    }

    @Test void unClienteNoPuedeEliminarEventos() {
        doThrow(new ResponseStatusException(HttpStatus.FORBIDDEN)).when(acceso).administrador();

        assertThatThrownBy(() -> service.eliminar(7L)).isInstanceOfSatisfying(ResponseStatusException.class,
                ex -> assertThat(ex.getStatusCode().value()).isEqualTo(403));
        verify(eventos, never()).deleteById(any());
    }
}
