package com.ticketuki.eventoservice.controller;

import com.ticketuki.eventoservice.service.EventoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import com.ticketuki.eventoservice.dto.EventoRequestDTO;
import org.mockito.ArgumentCaptor;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.assertThat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EventoController.class)
class EventoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EventoService eventoService;

    private String body(String participantes) {
        return """
            {"nombre_evento":"Festival","aforo_evento":100,"fecha_evento":"2027-01-10",
             "estado_evento_id_estado":1,"recinto_id_recinto":8%s}
            """.formatted(participantes == null ? "" : ",\"participantes\":\"" + participantes + "\"");
    }

    @Test
    void crear_admiteCuerpoAnteriorSinParticipantes() throws Exception {
        mockMvc.perform(post("/eventos").contentType(MediaType.APPLICATION_JSON).content(body(null)))
                .andExpect(status().isCreated());
        var captor = ArgumentCaptor.forClass(EventoRequestDTO.class);
        verify(eventoService).crear(captor.capture());
        assertThat(captor.getValue().getParticipantes()).isNull();
    }

    @Test
    void crear_recibeParticipantesEnElEvento() throws Exception {
        mockMvc.perform(post("/eventos").contentType(MediaType.APPLICATION_JSON).content(body("Banda A; Banda B")))
                .andExpect(status().isCreated());
        var captor = ArgumentCaptor.forClass(EventoRequestDTO.class);
        verify(eventoService).crear(captor.capture());
        assertThat(captor.getValue().getParticipantes()).isEqualTo("Banda A; Banda B");
    }

    @Test
    void crear_rechazaParticipantesDemasiadoLargos() throws Exception {
        mockMvc.perform(post("/eventos").contentType(MediaType.APPLICATION_JSON).content(body("a".repeat(501))))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.participantes").exists());
        verifyNoInteractions(eventoService);
    }

    @ParameterizedTest
    @ValueSource(strings = {"estado_evento_id_estado", "recinto_id_recinto"})
    void crear_rechazaReferenciasNegativas(String campo) throws Exception {
        String payload = body(null).replace("\"" + campo + "\":" + (campo.startsWith("estado") ? "1" : "8"),
                "\"" + campo + "\":-1");
        mockMvc.perform(post("/eventos").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors." + campo).exists());
        verifyNoInteractions(eventoService);
    }

    // ─────────────validación @Valid - 400 ─────────────
    @Test
    void crear_conBodyInvalido_devuelve400() throws Exception {
        // falta nombre_evento (@NotBlank), aforo_evento, y fecha_evento (@NotNull)
        String bodyInvalido = "{}";

        mockMvc.perform(post("/eventos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validación fallida"))
                .andExpect(jsonPath("$.status").value(400));
    }
}
