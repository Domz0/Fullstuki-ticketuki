package com.ticketuki.authservice.service;

import com.ticketuki.authservice.dto.RegistroRequestDTO;
import com.ticketuki.authservice.model.*;
import com.ticketuki.authservice.repository.UsuarioAuthRepository;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class RegistroStoreTest {
    UsuarioAuthRepository repository = mock(UsuarioAuthRepository.class);
    RegistroStore store = new RegistroStore(repository);
    RegistroRequestDTO request() {
        var dto = new RegistroRequestDTO();
        dto.setUsername("nuevo");
        dto.setPassword("password123");
        return dto;
    }
    @Test void registroPublicoCreaClienteInactivo() {
        when(repository.saveAndFlush(any())).thenAnswer(i -> {
            UsuarioAuth auth = i.getArgument(0);
            auth.setId_usuario_auth(7L);
            assertThat(auth.getRol()).isEqualTo(Rol.CLIENTE);
            assertThat(auth.isActivo()).isFalse();
            assertThat(auth.getUsuarioId()).isNull();
            return auth;
        });
        var reserva = store.reservar(request(), "perfil");
        assertThat(reserva.authId()).isEqualTo(7L);
        assertThat(reserva.activo()).isFalse();
        assertThat(reserva.clave()).isNotBlank();
    }
    @Test void reintentoReutilizaRegistroSinDuplicarlo() {
        var auth = new UsuarioAuth(7L, "nuevo", "password123", Rol.CLIENTE, null);
        auth.setActivo(false);
        auth.setRegistroId("clave");
        auth.setRegistroFingerprint("perfil");
        when(repository.findForUpdateByUsername("nuevo")).thenReturn(Optional.of(auth));
        assertThat(store.reservar(request(), "perfil").clave()).isEqualTo("clave");
        assertThatThrownBy(() -> store.reservar(request(), "otro"))
            .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        verify(repository, never()).saveAndFlush(any());
    }
    @Test void activacionVinculaPerfilYNoPermiteReasignarlo() {
        var auth = new UsuarioAuth(7L, "nuevo", "password123", Rol.CLIENTE, null);
        auth.setActivo(false);
        auth.setRegistroId("clave");
        when(repository.findForUpdate(7L)).thenReturn(Optional.of(auth));
        store.activar(7L, "clave", 3L);
        assertThat(auth.isActivo()).isTrue();
        assertThat(auth.getUsuarioId()).isEqualTo(3L);
        assertThatThrownBy(() -> store.activar(7L, "clave", 4L))
            .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
    }

    @Test void registroNoReactivaCuentaDesactivadaPorAdmin() {
        var auth = new UsuarioAuth(7L, "nuevo", "password123", Rol.CLIENTE, 3L);
        auth.setActivo(false);
        auth.setRegistroId("clave");
        auth.setRegistroFingerprint("perfil");
        when(repository.findForUpdateByUsername("nuevo")).thenReturn(Optional.of(auth));
        assertThatThrownBy(() -> store.reservar(request(), "perfil"))
            .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        verify(repository, never()).saveAndFlush(any());
    }
    @Test void permiteCorregirPerfilRechazadoSinCambiarCredenciales() {
        var auth = new UsuarioAuth(7L, "nuevo", "password123", Rol.CLIENTE, null);
        auth.setActivo(false);
        auth.setRegistroId("anterior");
        auth.setRegistroRechazado(true);
        auth.setRegistroFingerprint("anterior");
        when(repository.findForUpdateByUsername("nuevo")).thenReturn(Optional.of(auth));
        when(repository.findForUpdate(7L)).thenReturn(Optional.of(auth));
        var reserva = store.reservar(request(), "corregido");
        assertThat(reserva.clave()).isNotEqualTo("anterior");
        assertThat(auth.getRegistroFingerprint()).isEqualTo("corregido");
        assertThat(auth.isRegistroRechazado()).isFalse();
        assertThatThrownBy(() -> store.activar(7L, "anterior", 9L))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        store.activar(7L, reserva.clave(), 9L);
        assertThat(auth.isActivo()).isTrue();
    }

    @Test void otraContrasenaNoPuedeRecuperarRegistroRechazado() {
        var auth = new UsuarioAuth(7L, "nuevo", "otra-clave", Rol.CLIENTE, null);
        auth.setActivo(false);
        auth.setRegistroId("anterior");
        auth.setRegistroRechazado(true);
        when(repository.findForUpdateByUsername("nuevo")).thenReturn(Optional.of(auth));
        assertThatThrownBy(() -> store.reservar(request(), "corregido"))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        verify(repository, never()).saveAndFlush(any());
    }

    @Test void rechazoTardioNoModificaUnIntentoNuevo() {
        var auth = new UsuarioAuth(7L, "nuevo", "password123", Rol.CLIENTE, null);
        auth.setRegistroId("nueva");
        when(repository.findForUpdate(7L)).thenReturn(Optional.of(auth));
        store.rechazar(7L, "vieja");
        assertThat(auth.isRegistroRechazado()).isFalse();
        verify(repository, never()).saveAndFlush(any());
    }
    @Test void respuestaDeRegistroTardiaNoReactivaCuentaDeshabilitada() {
        var auth = new UsuarioAuth(7L,"nuevo","password123",Rol.CLIENTE,3L);
        auth.setActivo(false);
        auth.setRegistroId("clave");
        when(repository.findForUpdate(7L)).thenReturn(Optional.of(auth));
        assertThatThrownBy(() -> store.activar(7L,"clave",3L))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        assertThat(auth.isActivo()).isFalse();
        verify(repository,never()).saveAndFlush(any());
    }
}
