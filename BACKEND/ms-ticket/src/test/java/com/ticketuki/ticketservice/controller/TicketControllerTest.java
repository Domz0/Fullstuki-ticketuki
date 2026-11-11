package com.ticketuki.ticketservice.controller;

import com.ticketuki.ticketservice.service.TicketService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import com.ticketuki.ticketservice.dto.TicketRequestDTO;
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

@WebMvcTest(TicketController.class)
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TicketService ticketService;

    private String bodyValido() {
        return """
            {"num_asiento":1,"nombre_titular":"Juan","run_titular":"12345678-k",
             "evento_id_evento":1,"sector_id_sector":1,"venta_id_venta":1}
            """;
    }

    @Test
    void crearNormalizaRun() throws Exception {
        mockMvc.perform(post("/tickets").contentType(MediaType.APPLICATION_JSON).content(bodyValido()))
                .andExpect(status().isCreated());
        var captor = ArgumentCaptor.forClass(TicketRequestDTO.class);
        verify(ticketService).crearTicket(captor.capture());
        assertThat(captor.getValue().getRun_titular()).isEqualTo("12.345.678-K");
    }

    @ParameterizedTest
    @ValueSource(strings = {"num_asiento", "evento_id_evento", "sector_id_sector", "venta_id_venta"})
    void rechazaIdentificadoresYAsientoNoPositivos(String campo) throws Exception {
        String body = bodyValido().replace("\"" + campo + "\":1", "\"" + campo + "\":0");
        mockMvc.perform(post("/tickets").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors." + campo).exists());
        verifyNoInteractions(ticketService);
    }

    @Test
    void rechazaNombreMayorA50() throws Exception {
        mockMvc.perform(post("/tickets").contentType(MediaType.APPLICATION_JSON)
                        .content(bodyValido().replace("Juan", "a".repeat(51))))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(ticketService);
    }

    @Test
    void jsonInvalidoDevuelve400() throws Exception {
        mockMvc.perform(post("/tickets").contentType(MediaType.APPLICATION_JSON).content("{"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(ticketService);
    }

    // ────────────6: validacion @Valid - 400 ─────────────
    @Test
    void crearTicket_conBodyInvalido_devuelve400() throws Exception {
        // faltan num_asiento, nombre_titular, run_titular, evento y sector...
        String bodyInvalido = "{}";

        mockMvc.perform(post("/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validación fallida"))
                .andExpect(jsonPath("$.status").value(400));
    }
}
