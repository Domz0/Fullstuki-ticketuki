package com.ticketuki.eventoservice.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EstadoEventoController.class)
class EstadoEventoControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void listaCatalogoLocal() throws Exception {
        mvc.perform(get("/estadosEvento")).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4))
                .andExpect(jsonPath("$[0].nombre").value("AGENDADO"));
    }

    @Test
    void rechazaEstadoDesconocido() throws Exception {
        mvc.perform(get("/estadosEvento/99")).andExpect(status().isBadRequest());
    }

    @Test
    void catalogoNoPermiteCrearEstados() throws Exception {
        mvc.perform(post("/estadosEvento")).andExpect(status().isMethodNotAllowed());
    }
}
