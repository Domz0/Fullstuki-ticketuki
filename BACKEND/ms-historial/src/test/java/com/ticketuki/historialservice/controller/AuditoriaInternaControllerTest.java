package com.ticketuki.historialservice.controller;

import com.ticketuki.historialservice.service.AuditoriaInternaService;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuditoriaInternaControllerTest {
    @Test void noAceptaEventosSinCredencialInterna() {
        var service = mock(AuditoriaInternaService.class);
        var controller = new AuditoriaInternaController(service, "interna");
        assertThatThrownBy(() -> controller.registrar("incorrecta", null)).isInstanceOf(ResponseStatusException.class);
        verifyNoInteractions(service);
    }
}
