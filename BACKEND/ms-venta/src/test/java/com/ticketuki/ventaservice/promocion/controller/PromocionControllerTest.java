package com.ticketuki.ventaservice.promocion.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ticketuki.ventaservice.promocion.service.PromocionService;

@WebMvcTest(PromocionController.class)
class PromocionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PromocionService promocionService;

    // ─────────────5: validacion @Valid - 400─────────────
    @Test
    void crearPromocion_conBodyInvalido_devuelve400() throws Exception {
        // descuento fuera de rango +100 y faltan campos obligatorios
        String bodyInvalido = """
            { "descuento": 500 }
            """;

        mockMvc.perform(post("/promociones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validación fallida"))
                .andExpect(jsonPath("$.status").value(400));
    }
}
