package com.ticketuki.usuarioservice.controller;

import com.ticketuki.usuarioservice.service.UsuarioService;
import com.ticketuki.usuarioservice.dto.UsuarioRequestDTO;
import com.ticketuki.usuarioservice.dto.UsuarioResponseDTO;
import com.ticketuki.usuarioservice.exception.UsuarioDuplicadoException;
import org.springframework.dao.DataIntegrityViolationException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;
import static org.assertj.core.api.Assertions.assertThat;
import org.mockito.ArgumentCaptor;

@WebMvcTest(UsuarioController.class)
class UsuarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UsuarioService usuarioService;

    @Autowired
    private ObjectMapper objectMapper;

    private String bodyValido() {
        return """
            {"run":"12345678-k","p_nombre":"Juan","a_materno":"Pérez",
             "a_paterno":"Soto","email":" JUAN@MAIL.COM ",
             "direccion":{"calle":"Av. Siempre Viva","region":"RM","comuna":"Ñuñoa","num_calle":742}}
            """;
    }

    // ──────────5: validacion @Valid - 400 con mensajee ───────────
    @Test
    void crearUsuario_conBodyInvalido_devuelve400() throws Exception {
        String bodyInvalido = """
            {
              "run": "123",
              "p_nombre": "",
              "a_materno": "Pérez",
              "a_paterno": "Soto",
              "email": "no-es-email"
            }
            """;

        mockMvc.perform(post("/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validación fallida"))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void crearUsuario_normalizaDatosAntesDeValidar() throws Exception {
        when(usuarioService.crearUsuario(any())).thenReturn(new UsuarioResponseDTO());
        mockMvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON).content(bodyValido()))
                .andExpect(status().isCreated());
        var captor = ArgumentCaptor.forClass(UsuarioRequestDTO.class);
        verify(usuarioService).crearUsuario(captor.capture());
        assertThat(captor.getValue().getRun()).isEqualTo("12.345.678-K");
        assertThat(captor.getValue().getEmail()).isEqualTo("juan@mail.com");
    }

    @Test
    void crearUsuario_exigeApellidoMaternoYDireccion() throws Exception {
        var body = (com.fasterxml.jackson.databind.node.ObjectNode) objectMapper.readTree(bodyValido());
        body.remove("a_materno");
        body.remove("direccion");
        mockMvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.a_materno").exists())
                .andExpect(jsonPath("$.errors.direccion").exists());
        verifyNoInteractions(usuarioService);
    }

    @Test
    void crearUsuario_rechazaDireccionIncompleta() throws Exception {
        mockMvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON)
                        .content(bodyValido().replace("\"num_calle\":742", "\"num_calle\":0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors['direccion.num_calle']").exists());
        verifyNoInteractions(usuarioService);
    }

    @Test
    void crearUsuario_rechazaCorreoMayorA100Caracteres() throws Exception {
        var body = (com.fasterxml.jackson.databind.node.ObjectNode) objectMapper.readTree(bodyValido());
        body.put("email", "a".repeat(60) + "@" + "b".repeat(36) + ".com");
        mockMvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.email").exists());
        verifyNoInteractions(usuarioService);
    }

    @Test
    void crearUsuario_conflictoDuplicadoDevuelve409() throws Exception {
        when(usuarioService.crearUsuario(any())).thenThrow(new UsuarioDuplicadoException("El email ya existe"));
        mockMvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON).content(bodyValido()))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.message").value("El email ya existe"));
    }

    @Test
    void crearUsuario_conflictoConcurrenteDevuelve409SinExponerSql() throws Exception {
        when(usuarioService.crearUsuario(any())).thenThrow(new DataIntegrityViolationException("SQL interno"));
        mockMvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON).content(bodyValido()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Los datos entran en conflicto con un registro existente"));
    }

    @Test
    void crearUsuario_jsonMalformadoDevuelve400() throws Exception {
        mockMvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON).content("{"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(usuarioService);
    }
}
