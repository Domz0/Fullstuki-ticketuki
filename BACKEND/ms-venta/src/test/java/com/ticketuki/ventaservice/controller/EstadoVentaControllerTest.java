package com.ticketuki.ventaservice.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EstadoVentaController.class)
class EstadoVentaControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void listaCatalogoLocal() throws Exception {
        mvc.perform(get("/estadosVenta")).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5))
                .andExpect(jsonPath("$[0].nombre").value("PENDIENTE"));
    }

    @Test
    void rechazaEstadoDesconocido() throws Exception {
        mvc.perform(get("/estadosVenta/99")).andExpect(status().isBadRequest());
    }

    @Test
    void catalogoNoPermiteCrearEstados() throws Exception {
        mvc.perform(post("/estadosVenta")).andExpect(status().isMethodNotAllowed());
    }
}
