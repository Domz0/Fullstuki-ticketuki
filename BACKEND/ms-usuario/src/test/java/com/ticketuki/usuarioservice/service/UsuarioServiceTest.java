package com.ticketuki.usuarioservice.service;

import com.ticketuki.usuarioservice.dto.DireccionDTO;
import com.ticketuki.usuarioservice.dto.UsuarioRequestDTO;
import com.ticketuki.usuarioservice.dto.UsuarioResponseDTO;
import com.ticketuki.usuarioservice.exception.UsuarioDuplicadoException;
import com.ticketuki.usuarioservice.exception.UsuarioNotFoundException;
import com.ticketuki.usuarioservice.model.DireccionUsuario;
import com.ticketuki.usuarioservice.model.Usuario;
import com.ticketuki.usuarioservice.repository.DireccionUsuarioRepository;
import com.ticketuki.usuarioservice.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private DireccionUsuarioRepository direccionRepository;

    @InjectMocks
    private UsuarioService usuarioService;

    private UsuarioRequestDTO requestValido() {
        DireccionDTO dir = new DireccionDTO("Av. Siempre Viva", "RM", "Ñuñoa", 742);
        return new UsuarioRequestDTO(
                "12.345.678-9", "Juan", "Carlos", "Pérez", "Soto",
                "juan.perez@mail.com", dir);
    }

    // ─────────────────────1 exito ─────────────────────────
    @Test
    void crearUsuario_conDatosValidos_devuelveUsuarioConId() {
        UsuarioRequestDTO req = requestValido();
        DireccionUsuario dirGuardada =
                new DireccionUsuario(10L, "Av. Siempre Viva", "RM", "Ñuñoa", 742);
        Usuario guardado = new Usuario(1L, "12.345.678-9", "Juan", "Carlos",
                "Pérez", "Soto", "juan.perez@mail.com", dirGuardada);

        when(direccionRepository.save(any(DireccionUsuario.class))).thenReturn(dirGuardada);
        when(usuarioRepository.saveAndFlush(any(Usuario.class))).thenReturn(guardado);

        UsuarioResponseDTO res = usuarioService.crearUsuario(req);

        assertThat(res.getId_usuario()).isEqualTo(1L);
        assertThat(res.getRun()).isEqualTo("12.345.678-9");
        assertThat(res.getEmail()).isEqualTo("juan.perez@mail.com");
        assertThat(res.getDireccion().getComuna()).isEqualTo("Ñuñoa");
        verify(usuarioRepository, times(1)).saveAndFlush(any(Usuario.class));
    }

    // ────────────────────2: error run duplicado ────────────────────
    @Test
    void crearUsuario_conRunDuplicado_lanzaUsuarioDuplicadoException() {
        UsuarioRequestDTO req = requestValido();
        when(usuarioRepository.findByRun(req.getRun()))
                .thenReturn(Optional.of(new Usuario(1L, req.getRun(), "Juan", "Carlos",
                        "Pérez", "Soto", req.getEmail(), null)));

        assertThatThrownBy(() -> usuarioService.crearUsuario(req))
                .isInstanceOf(UsuarioDuplicadoException.class)
                .hasMessage("El RUN ya existe");
        verifyNoInteractions(direccionRepository);
        verify(usuarioRepository, never()).saveAndFlush(any());
    }

    // ─────(ArgumentCaptoor) la entidad guardada se construye bien ───────
    @Test
    void crearUsuario_guardaUsuarioConDatosCorrectos() {
        UsuarioRequestDTO req = requestValido();
        DireccionUsuario dirGuardada =
                new DireccionUsuario(10L, "Av. Siempre Viva", "RM", "Ñuñoa", 742);

        when(direccionRepository.save(any(DireccionUsuario.class))).thenReturn(dirGuardada);
        // save devuelve un objeto distinto, el argumento capturado conserva su estado original
        when(usuarioRepository.saveAndFlush(any(Usuario.class)))
                .thenReturn(new Usuario(1L, "12.345.678-9", "Juan", "Carlos",
                        "Pérez", "Soto", "juan.perez@mail.com", dirGuardada));

        usuarioService.crearUsuario(req);

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).saveAndFlush(captor.capture());
        Usuario enviado = captor.getValue();

        assertThat(enviado.getId_usuario()).isNull();                 // sin id, lo asigna la BD
        assertThat(enviado.getRun()).isEqualTo("12.345.678-9");
        assertThat(enviado.getEmail()).isEqualTo("juan.perez@mail.com");
        assertThat(enviado.getDireccion()).isEqualTo(dirGuardada);    // direccion guardada enlazada
    }

    // ────────────3 error buscar inexistente ───────────────
    @Test
    void obtenerUsuarioPorId_inexistente_lanzaUsuarioNotFound() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.obtenerUsuarioPorId(99L))
                .isInstanceOf(UsuarioNotFoundException.class)
                .hasMessage("Usuario no encontrado con ID: 99");
    }

    // ─────────4 error eliminar + verificacion──────────
    @Test
    void eliminarUsuario_inexistente_lanzaExcepcionYNoElimina() {
        when(usuarioRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> usuarioService.eliminarUsuario(99L))
                .isInstanceOf(UsuarioNotFoundException.class)
                .hasMessage("Usuario no encontrado!");

        verify(usuarioRepository, never()).deleteById(anyLong());
    }

    @Test
    void crearUsuario_conEmailDuplicado_noGuardaDireccion() {
        UsuarioRequestDTO req = requestValido();
        when(usuarioRepository.findByEmailIgnoreCase(req.getEmail()))
                .thenReturn(Optional.of(new Usuario(2L, "11.111.111-1", "Ana", null,
                        "Pérez", "Soto", req.getEmail(), null)));
        assertThatThrownBy(() -> usuarioService.crearUsuario(req))
                .isInstanceOf(UsuarioDuplicadoException.class).hasMessage("El email ya existe");
        verifyNoInteractions(direccionRepository);
        verify(usuarioRepository, never()).saveAndFlush(any());
    }

    @Test
    void crearUsuario_normalizaRunYCorreo() {
        UsuarioRequestDTO req = new UsuarioRequestDTO("12345678-k", "Juan", null,
                "Pérez", "Soto", " JUAN@MAIL.COM ", requestValido().getDireccion());
        when(usuarioRepository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        UsuarioResponseDTO response = usuarioService.crearUsuario(req);
        assertThat(response.getRun()).isEqualTo("12.345.678-K");
        assertThat(response.getEmail()).isEqualTo("juan@mail.com");
        verify(usuarioRepository).findByRun("12.345.678-K");
        verify(usuarioRepository).findByEmailIgnoreCase("juan@mail.com");
    }

    @Test
    void actualizarUsuario_permiteSusDatosYAgregaDireccionFaltante() {
        UsuarioRequestDTO req = requestValido();
        Usuario usuario = new Usuario(1L, req.getRun(), "Juan", null, "Pérez", "Soto", req.getEmail(), null);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.findByRun(req.getRun())).thenReturn(Optional.of(usuario));
        when(usuarioRepository.findByEmailIgnoreCase(req.getEmail())).thenReturn(Optional.of(usuario));
        when(usuarioRepository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        UsuarioResponseDTO response = usuarioService.actualizarUsuario(1L, req);
        assertThat(response.getDireccion().getCalle()).isEqualTo("Av. Siempre Viva");
        assertThat(response.getDireccion().getNum_calle()).isEqualTo(742);
        assertThat(usuario.getDireccion()).isNotNull();
    }

    @Test
    void actualizarUsuario_rechazaEmailDeOtroUsuarioAntesDeModificar() {
        UsuarioRequestDTO req = requestValido();
        Usuario original = new Usuario(1L, "11.111.111-1", "Ana", null, "Pérez", "Soto", "ana@mail.com", null);
        Usuario otro = new Usuario(2L, req.getRun(), "Juan", null, "Pérez", "Soto", req.getEmail(), null);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(original));
        when(usuarioRepository.findByEmailIgnoreCase(req.getEmail())).thenReturn(Optional.of(otro));
        assertThatThrownBy(() -> usuarioService.actualizarUsuario(1L, req))
                .isInstanceOf(UsuarioDuplicadoException.class).hasMessage("El email ya existe");
        assertThat(original.getEmail()).isEqualTo("ana@mail.com");
        assertThat(original.getRun()).isEqualTo("11.111.111-1");
        verify(usuarioRepository, never()).saveAndFlush(any());
    }

    @Test
    void actualizarUsuario_rechazaRunDeOtroUsuario() {
        UsuarioRequestDTO req = requestValido();
        Usuario original = new Usuario(1L, "11.111.111-1", "Ana", null, "Pérez", "Soto", "ana@mail.com", null);
        Usuario otro = new Usuario(2L, req.getRun(), "Juan", null, "Pérez", "Soto", req.getEmail(), null);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(original));
        when(usuarioRepository.findByRun(req.getRun())).thenReturn(Optional.of(otro));
        assertThatThrownBy(() -> usuarioService.actualizarUsuario(1L, req))
                .isInstanceOf(UsuarioDuplicadoException.class).hasMessage("El RUN ya existe");
        verify(usuarioRepository, never()).saveAndFlush(any());
    }
}
