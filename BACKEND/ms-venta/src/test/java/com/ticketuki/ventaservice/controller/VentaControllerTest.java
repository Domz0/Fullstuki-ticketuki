package com.ticketuki.ventaservice.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ticketuki.ventaservice.dto.EstadoVentaDTO;
import com.ticketuki.ventaservice.dto.VentaResponseDTO;
import com.ticketuki.ventaservice.service.VentaService;

@WebMvcTest(VentaController.class)
class VentaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VentaService ventaService;

    // ────────(controller ecxito): get /ventas/{id} - 200 + body─────────
    @Test
    void obtenerVenta_existente_devuelve200ConBody() throws Exception {
        VentaResponseDTO venta = new VentaResponseDTO(
                1L, LocalDateTime.now(), "TARJETA", "AUTH-1", 25800L,
                new EstadoVentaDTO(1L, "PENDIENTE"), List.of());
        when(ventaService.obtenerVenta(1L)).thenReturn(venta);

        mockMvc.perform(get("/ventas/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id_venta").value(1))
                .andExpect(jsonPath("$.monto_total").value(25800))
                .andExpect(jsonPath("$.estado_venta.nombre").value("PENDIENTE"));
    }

    // ─────────────5 validacion @Valid - 400 ─────────────
    @Test
    void crearVenta_conBodyInvalido_devuelve400() throws Exception {
        // falta medio_pago, cod_autorizacion, estado y detalles:lista vacia
        String bodyInvalido = """
            { "detalles": [] }
            """;

        mockMvc.perform(post("/ventas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validación fallida"))
                .andExpect(jsonPath("$.status").value(400));
    }
}
