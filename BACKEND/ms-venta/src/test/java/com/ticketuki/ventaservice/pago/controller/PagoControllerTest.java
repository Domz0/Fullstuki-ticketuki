package com.ticketuki.ventaservice.pago.controller;

import com.ticketuki.ventaservice.pago.service.PagoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PagoController.class)
class PagoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PagoService pagoService;

    // ─────────────5: validacion @Valid - 400 ─────────────
    @Test
    void procesarPago_conBodyInvalido_devuelve400() throws Exception {
        // monto negativo y faltan medio pago, cod autorizacion, venta id, usuarioId
        String bodyInvalido = """
            { "monto": -100 }
            """;

        mockMvc.perform(post("/pagos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validación fallida"))
                .andExpect(jsonPath("$.status").value(400));
    }
}
