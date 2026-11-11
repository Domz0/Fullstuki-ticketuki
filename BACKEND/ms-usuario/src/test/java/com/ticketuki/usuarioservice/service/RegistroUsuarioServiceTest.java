package com.ticketuki.usuarioservice.service;

import com.ticketuki.usuarioservice.dto.*;
import com.ticketuki.usuarioservice.model.RegistroUsuario;
import com.ticketuki.usuarioservice.repository.RegistroUsuarioRepository;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

class RegistroUsuarioServiceTest {
    @Test void reintentoDevuelvePerfilExistenteSinDuplicarlo() {
        var repository = mock(RegistroUsuarioRepository.class);
        var usuarios = mock(UsuarioService.class);
        var registro = new RegistroUsuario();
        registro.setId("clave");
        registro.setUsuarioId(3L);
        var perfil = new UsuarioResponseDTO();
        perfil.setId_usuario(3L);
        when(repository.bloquear("clave")).thenReturn(Optional.of(registro));
        when(usuarios.obtenerUsuarioPorId(3L)).thenReturn(perfil);
        var service = new RegistroUsuarioService(repository, usuarios);
        assertThat(service.registrar("clave", new UsuarioRequestDTO()).getId_usuario()).isEqualTo(3L);
        verify(usuarios, never()).crearUsuario(any());
        var orden = inOrder(repository);
        orden.verify(repository).asegurarRegistro("clave");
        orden.verify(repository).bloquear("clave");
    }
}
