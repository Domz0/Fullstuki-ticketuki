package com.ticketuki.usuarioservice.controller;

import com.ticketuki.usuarioservice.service.RegistroUsuarioService;
import com.ticketuki.usuarioservice.dto.UsuarioRequestDTO;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

class RegistroInternoControllerTest {
    @Test void credencialAusenteOIncorrectaNoCreaPerfil() {
        var service = mock(RegistroUsuarioService.class);
        var controller = new RegistroInternoController(service, "clave-interna");
        assertThatThrownBy(() -> controller.registrar(UUID.randomUUID(), "", new UsuarioRequestDTO()))
            .isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> controller.registrar(UUID.randomUUID(), "otra", new UsuarioRequestDTO()))
            .isInstanceOf(ResponseStatusException.class);
        verifyNoInteractions(service);
    }
}
