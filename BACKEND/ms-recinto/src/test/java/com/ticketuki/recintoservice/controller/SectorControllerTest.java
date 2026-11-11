package com.ticketuki.recintoservice.controller;

import com.ticketuki.recintoservice.service.SectorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SectorController.class)
class SectorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SectorService sectorService;

    // ───────────── 5: validacion @Valid - 400 ─────────────
    @Test
    void crearSector_conBodyInvalido_devuelve400() throws Exception {
        // faltan nombre, capacidad, precio y recinto_id (todos son obligatorios...)
        String bodyInvalido = "{}";

        mockMvc.perform(post("/sectores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validación fallida"))
                .andExpect(jsonPath("$.status").value(400));
    }
}
