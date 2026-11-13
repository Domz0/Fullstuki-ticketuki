package com.ticketuki.usuarioservice.service;

import com.ticketuki.common.security.AccesoServicio;
import com.ticketuki.common.validation.ValidacionDatos;
import com.ticketuki.usuarioservice.dto.UsuarioRequestDTO;
import com.ticketuki.usuarioservice.model.Usuario;
import com.ticketuki.usuarioservice.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class UsuarioPermisosTest {
    @Test void clienteNoLeeNiActualizaPerfilAjeno() {
        var acceso = spy(new AccesoServicio("http://localhost", "http://localhost", "test"));
        doReturn(new AccesoServicio.Actor(10L, "cliente", "CLIENTE", 1L, true)).when(acceso).actor();
        var usuarios = mock(UsuarioRepository.class);
        var direcciones = mock(DireccionUsuarioRepository.class);
        var service = new UsuarioService(mock(ValidacionDatos.class), acceso, usuarios, direcciones);
        assertThatThrownBy(() -> service.obtenerUsuarioPorId(2L)).isInstanceOfSatisfying(ResponseStatusException.class,
                ex -> assertThat(ex.getStatusCode().value()).isEqualTo(403));
        assertThatThrownBy(() -> service.actualizarUsuario(2L, new UsuarioRequestDTO()))
                .isInstanceOfSatisfying(ResponseStatusException.class, ex -> assertThat(ex.getStatusCode().value()).isEqualTo(403));
        verifyNoInteractions(usuarios, direcciones);
    }

    @Test void clienteLeePerfilPropioYAdministradorPuedeLeerOtro() {
        var acceso = spy(new AccesoServicio("http://localhost", "http://localhost", "test"));
        doReturn(new AccesoServicio.Actor(10L, "cliente", "CLIENTE", 1L, true)).when(acceso).actor();
        var usuarios = mock(UsuarioRepository.class);
        var service = new UsuarioService(mock(ValidacionDatos.class), acceso, usuarios, mock(DireccionUsuarioRepository.class));
        var usuario = new Usuario();
        usuario.setId_usuario(1L);
        when(usuarios.findById(1L)).thenReturn(Optional.of(usuario));
        assertThat(service.obtenerUsuarioPorId(1L).getId_usuario()).isEqualTo(1L);
        doReturn(new AccesoServicio.Actor(20L, "admin", "ADMIN", null, true)).when(acceso).actor();
        assertThat(service.obtenerUsuarioPorId(1L).getId_usuario()).isEqualTo(1L);
    }
}
