package com.ticketuki.authservice.service;

import com.ticketuki.authservice.client.RegistroUsuarioClient;
import com.ticketuki.authservice.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

class RegistroServiceTest {
    RegistroStore store = mock(RegistroStore.class);
    RegistroUsuarioClient usuarios = mock(RegistroUsuarioClient.class);
    AuthService auth = mock(AuthService.class);
    RegistroService service = new RegistroService(store, usuarios, auth, new ObjectMapper());
    RegistroRequestDTO request() {
        var dto = new RegistroRequestDTO();
        dto.setUsername("cliente");
        dto.setPassword("password123");
        dto.setUsuario(new PerfilRegistroDTO());
        return dto;
    }
    @Test void activaSoloDespuesDeCrearPerfil() {
        var dto = request();
        when(store.reservar(eq(dto), anyString())).thenReturn(new RegistroStore.Reserva(1L, "clave", false));
        when(usuarios.registrar("clave", dto.getUsuario())).thenReturn(3L);
        service.registrar(dto);
        var orden = inOrder(usuarios, store, auth);
        orden.verify(store).reservar(eq(dto), anyString());
        orden.verify(usuarios).registrar("clave", dto.getUsuario());
        orden.verify(store).activar(1L, 3L);
        orden.verify(auth).login(any());
    }
    @Test void falloRemotoNoActivaCuentaNiEmiteToken() {
        var dto = request();
        when(store.reservar(eq(dto), anyString())).thenReturn(new RegistroStore.Reserva(1L, "clave", false));
        when(usuarios.registrar("clave", dto.getUsuario())).thenThrow(new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE));
        assertThatThrownBy(() -> service.registrar(dto)).isInstanceOf(ResponseStatusException.class);
        verify(store, never()).activar(any(), any());
        verifyNoInteractions(auth);
    }
    @Test void reintentoCompletadoNoVuelveACrearPerfil() {
        var dto = request();
        when(store.reservar(eq(dto), anyString())).thenReturn(new RegistroStore.Reserva(1L, "clave", true));
        service.registrar(dto);
        verifyNoInteractions(usuarios);
        verify(auth).login(any());
    }
}
