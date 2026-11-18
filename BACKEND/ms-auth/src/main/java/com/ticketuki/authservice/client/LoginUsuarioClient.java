package com.ticketuki.authservice.client;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@Component
public class LoginUsuarioClient {
    private final RestClient client;
    private final String key;
    public record Perfil(Long id_usuario) {}

    public LoginUsuarioClient(@Value("${ms.usuario.url:http://localhost:8001}") String url,
                              @Value("${internal.service-key:}") String key) {
        client = com.ticketuki.common.http.RestServicios.crear(url);
        this.key = key;
    }

    public Optional<Long> buscarPorCorreo(String correo) {
        if (key.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Falta configurar INTERNAL_SERVICE_KEY");
        try {
            var perfil = client.get()
                    .uri(builder -> builder.path("/interno/usuarios/por-correo").queryParam("correo", "{correo}").build(correo))
                    .header("X-Internal-Key", key).retrieve().body(Perfil.class);
            if (perfil == null || perfil.id_usuario() == null || perfil.id_usuario() <= 0)
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Respuesta de perfil invalida");
            return Optional.of(perfil.id_usuario());
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode().value() == 404) return Optional.empty();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo consultar el correo. Intenta nuevamente", ex);
        } catch (RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo consultar el correo. Intenta nuevamente", ex);
        }
    }
}
