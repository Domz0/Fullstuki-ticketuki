package com.ticketuki.authservice.service;

import com.ticketuki.authservice.model.*;
import com.ticketuki.authservice.repository.UsuarioAuthRepository;
import com.ticketuki.authservice.security.JwtUtil;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class SesionServiceTest {
    UsuarioAuthRepository repository = mock(UsuarioAuthRepository.class);
    JwtUtil jwt = mock(JwtUtil.class);
    SesionService service = new SesionService(repository, jwt);
    UsuarioAuth cuenta = new UsuarioAuth(1L, "cliente", "clave", Rol.CLIENTE, 2L);
    Claims claims = mock(Claims.class);
    void preparar() {
        when(jwt.validar("token")).thenReturn(claims);
        when(claims.get("id")).thenReturn(1);
        when(claims.get("version")).thenReturn(0);
        when(claims.get("usuarioId")).thenReturn(2);
        when(claims.get("rol")).thenReturn("CLIENTE");
        when(claims.getSubject()).thenReturn("cliente");
        when(repository.findById(1L)).thenReturn(Optional.of(cuenta));
    }
    @Test void aceptaTokenVigenteYRechazaCuentaDesactivada() {
        preparar();
        assertThat(service.autenticar("Bearer token")).isSameAs(cuenta);
        cuenta.setActivo(false);
        assertThatThrownBy(() -> service.autenticar("Bearer token")).isInstanceOf(ResponseStatusException.class);
    }
    @Test void rechazaVersionAnteriorAunqueTokenEsteFirmado() {
        preparar();
        cuenta.setTokenVersion(1);
        assertThatThrownBy(() -> service.autenticar("Bearer token")).isInstanceOf(ResponseStatusException.class);
    }
    @Test void rechazaTokenSinVersionYRolAntiguo() {
        preparar();
        when(claims.get("version")).thenReturn(null);
        assertThatThrownBy(() -> service.autenticar("Bearer token")).isInstanceOf(ResponseStatusException.class);
        when(claims.get("version")).thenReturn(0);
        when(claims.get("rol")).thenReturn("VENDEDOR");
        assertThatThrownBy(() -> service.autenticar("Bearer token")).isInstanceOf(ResponseStatusException.class);
    }
}
