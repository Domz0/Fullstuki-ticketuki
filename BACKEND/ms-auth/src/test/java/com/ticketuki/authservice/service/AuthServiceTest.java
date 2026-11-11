package com.ticketuki.authservice.service;

import com.ticketuki.authservice.dto.LoginRequestDTO;
import com.ticketuki.authservice.exception.CredencialesInvalidasException;
import com.ticketuki.authservice.model.Rol;
import com.ticketuki.authservice.model.UsuarioAuth;
import com.ticketuki.authservice.repository.UsuarioAuthRepository;
import com.ticketuki.authservice.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {
    private final UsuarioAuthRepository repository = mock(UsuarioAuthRepository.class);
    private final JwtUtil jwt = mock(JwtUtil.class);
    private final AuthService service = new AuthService(repository, jwt);
    private UsuarioAuth usuario;

    @BeforeEach
    void preparar() {
        usuario = new UsuarioAuth(4L, "cliente", "clave-correcta", Rol.CLIENTE, 81L);
        when(repository.findByUsername("cliente")).thenReturn(Optional.of(usuario));
    }

    @ParameterizedTest
    @EnumSource(Rol.class)
    void autenticaYDevuelveIdentidadesDistintas(Rol rol) {
        usuario.setRol(rol);
        when(jwt.generarToken(usuario)).thenReturn("token-firmado");
        when(jwt.getExpiracionMs()).thenReturn(3600000L);
        var response = service.login(new LoginRequestDTO("cliente", "clave-correcta"));
        assertThat(response.getToken()).isEqualTo("token-firmado");
        assertThat(response.getTipo()).isEqualTo("Bearer");
        assertThat(response.getUsername()).isEqualTo("cliente");
        assertThat(response.getExpiraEnMs()).isEqualTo(3600000L);
        assertThat(response.getAuthId()).isEqualTo(4L);
        assertThat(response.getUsuarioId()).isEqualTo(81L);
        assertThat(response.getRol()).isEqualTo(rol);
    }

    @Test
    void rechazaPasswordIncorrectoSinEmitirToken() {
        assertThatThrownBy(() -> service.login(new LoginRequestDTO("cliente", "incorrecta")))
                .isInstanceOf(CredencialesInvalidasException.class)
                .hasMessage("Usuario o contraseña incorrectos");
        verifyNoInteractions(jwt);
    }

    @Test
    void rechazaUsuarioInexistenteConElMismoError() {
        assertThatThrownBy(() -> service.login(new LoginRequestDTO("ausente", "clave-correcta")))
                .isInstanceOf(CredencialesInvalidasException.class)
                .hasMessage("Usuario o contraseña incorrectos");
        verifyNoInteractions(jwt);
    }


    @Test
    void registroPendienteNoPuedeIniciarSesion() {
        usuario.setActivo(false);
        assertThatThrownBy(() -> service.login(new LoginRequestDTO("cliente", "clave-correcta")))
                .isInstanceOf(CredencialesInvalidasException.class);
        verifyNoInteractions(jwt);
    }

}
