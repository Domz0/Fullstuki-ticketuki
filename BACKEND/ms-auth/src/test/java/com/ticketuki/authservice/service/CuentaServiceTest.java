package com.ticketuki.authservice.service;

import com.ticketuki.authservice.dto.CambiarContrasenaDTO;
import com.ticketuki.authservice.model.*;
import com.ticketuki.authservice.repository.UsuarioAuthRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class CuentaServiceTest {
    UsuarioAuthRepository repository = mock(UsuarioAuthRepository.class);
    CuentaService service = new CuentaService(repository);
    UsuarioAuth admin = new UsuarioAuth(1L, "admin", "password123", Rol.ADMIN, null);
    UsuarioAuth cliente = new UsuarioAuth(2L, "cliente", "password123", Rol.CLIENTE, 3L);

    void preparar() {
        when(repository.findById(1L)).thenReturn(Optional.of(admin));
        when(repository.findForUpdate(2L)).thenReturn(Optional.of(cliente));
        when(repository.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));
    }
    @Test void cambiarContrasenaExigeActualEInvalidaSesiones() {
        preparar();
        assertThatThrownBy(() -> service.cambiarContrasena(2L, new CambiarContrasenaDTO("incorrecta", "nueva12345")))
            .isInstanceOf(ResponseStatusException.class);
        assertThat(cliente.getTokenVersion()).isZero();
        service.cambiarContrasena(2L, new CambiarContrasenaDTO("password123", "nueva12345"));
        assertThat(cliente.getPassword()).isEqualTo("nueva12345");
        assertThat(cliente.getTokenVersion()).isEqualTo(1);
    }
    @Test void desactivarYReactivarNoRestauraTokensAnteriores() {
        preparar();
        service.cambiarActivo(1L, 2L, false);
        assertThat(cliente.isActivo()).isFalse();
        service.cambiarActivo(1L, 2L, true);
        assertThat(cliente.isActivo()).isTrue();
        assertThat(cliente.getTokenVersion()).isEqualTo(2);
    }
    @Test void adminNoPuedeQuitarseSuPropioAcceso() {
        preparar();
        assertThatThrownBy(() -> service.cambiarActivo(1L, 1L, false)).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> service.cambiarRol(1L, 1L, Rol.CLIENTE)).isInstanceOf(ResponseStatusException.class);
        verify(repository, never()).saveAndFlush(any());
    }
    @Test void registroPendienteNoPuedeActivarseManualmente() {
        preparar();
        cliente.setUsuarioId(null);
        cliente.setActivo(false);
        assertThatThrownBy(() -> service.cambiarActivo(1L, 2L, true)).isInstanceOf(ResponseStatusException.class);
        verify(repository, never()).saveAndFlush(any());
    }
    @Test void cambiarRolInvalidaTokensYClienteNoAdministra() {
        preparar();
        service.cambiarRol(1L, 2L, Rol.ADMIN);
        assertThat(cliente.getTokenVersion()).isEqualTo(1);
        when(repository.findById(1L)).thenReturn(Optional.of(new UsuarioAuth(1L, "otro", "clave", Rol.CLIENTE, 5L)));
        assertThatThrownBy(() -> service.cambiarActivo(1L, 2L, false)).isInstanceOf(ResponseStatusException.class);
    }
}
