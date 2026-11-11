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
        when(repository.findForUpdate(7L)).thenReturn(Optional.of(auth));
        store.activar(7L, 3L);
        assertThat(auth.isActivo()).isTrue();
        assertThat(auth.getUsuarioId()).isEqualTo(3L);
        assertThatThrownBy(() -> store.activar(7L, 4L))
            .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
    }
}
