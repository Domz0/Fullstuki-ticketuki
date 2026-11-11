package com.ticketuki.authservice.client;

import com.ticketuki.authservice.dto.PerfilRegistroDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Component
public class RegistroUsuarioClient {
    private final RestClient client;
    private final String key;
    public record Perfil(Long id_usuario) {}

    public RegistroUsuarioClient(@Value("${ms.usuario.url:http://localhost:8001}") String url,
                                 @Value("${internal.service-key:}") String key) {
        this.key = key;
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(5000);
        client = RestClient.builder().baseUrl(url).requestFactory(factory).build();
    }

    public Long registrar(String registroId, PerfilRegistroDTO perfil) {
        if (key.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Falta configurar INTERNAL_SERVICE_KEY");
        try {
            var response = client.post().uri("/interno/registros/{id}", registroId)
                    .header("X-Internal-Key", key).body(perfil).retrieve().body(Perfil.class);
            if (response == null || response.id_usuario() == null || response.id_usuario() <= 0)
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Respuesta de perfil inválida");
            return response.id_usuario();
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode().value() == 409)
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El RUN o email ya está registrado; la cuenta permanece pendiente", ex);
            if (ex.getStatusCode().value() == 400)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Revisar los datos del perfil", ex);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo completar el perfil. Reintentar con los mismos datos", ex);
        } catch (ResourceAccessException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Registro pendiente. Reintentar con los mismos datos", ex);
        }
    }
}
