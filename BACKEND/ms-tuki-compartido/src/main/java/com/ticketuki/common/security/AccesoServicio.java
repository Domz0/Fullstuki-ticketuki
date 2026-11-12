package com.ticketuki.common.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;
import com.ticketuki.common.http.RestServicios;
import java.util.Collection;
import java.util.Objects;

public class AccesoServicio {
    private static final String ATRIBUTO = AccesoServicio.class.getName();
    public record Actor(Long authId, String username, String rol, Long usuarioId, boolean activo) {}
    private final RestClient auth;
    private final RestClient usuarios;
    private final String clave;

    public AccesoServicio(String authUrl, String usuarioUrl, String clave) {
        this.auth = RestServicios.crear(authUrl);
        this.usuarios = RestServicios.crear(usuarioUrl);
        this.clave = clave;
    }

    private HttpServletRequest request() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes)
            return attributes.getRequest();
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Se requiere una sesion autenticada");
    }

    public Actor actor() {
        var request = request();
        if (request.getAttribute(ATRIBUTO) instanceof Actor actor) return actor;
        String interna = request.getHeader("X-Internal-Key");
        // Una credencial interna solo se acepta tras comparar con la clave configurada.
        if (interna != null) {
            ClaveInterna.validar(clave, interna);
            var actor = new Actor(null, "servicio", "INTERNO", null, true);
            request.setAttribute(ATRIBUTO, actor);
            return actor;
        }
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ") || token.substring(7).isBlank())
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Se requiere un token Bearer");
        try {
            Actor actor = auth.get().uri("/auth/me").header("Authorization", token).retrieve().body(Actor.class);
            if (actor == null || actor.authId() == null || actor.authId() <= 0 || !actor.activo()
                    || !java.util.Set.of("ADMIN", "CLIENTE").contains(actor.rol() == null ? "" : actor.rol())
                    || ("CLIENTE".equals(actor.rol()) && (actor.usuarioId() == null || actor.usuarioId() <= 0)))
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesion invalida");
            request.setAttribute(ATRIBUTO, actor);
            return actor;
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode().value() == 401 || ex.getStatusCode().value() == 403)
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesion invalida o vencida");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo verificar la sesion", ex);
        } catch (RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo verificar la sesion", ex);
        }
    }

    public boolean privilegiado() {
        return java.util.Set.of("ADMIN", "INTERNO").contains(actor().rol());
    }

    public void administrador() {
        if (!privilegiado()) denegar();
    }

    public void propietario(Long usuarioId) {
        if (privilegiado()) return;
        if (usuarioId == null || !Objects.equals(actor().usuarioId(), usuarioId)) denegar();
    }

    public void propietarios(Collection<Long> usuarios) {
        if (privilegiado()) return;
        if (usuarios == null || usuarios.isEmpty()
                || usuarios.stream().anyMatch(id -> id == null || !Objects.equals(actor().usuarioId(), id))) denegar();
    }

    public void titular(String run) {
        if (!esTitular(run)) denegar();
    }

    public boolean esTitular(String run) {
        if (privilegiado()) return true;
        var request = request();
        String atributo = ATRIBUTO + ".run";
        String propio = (String) request.getAttribute(atributo);
        if (propio == null) {
            ClaveInterna.validar(clave, clave);
            com.ticketuki.common.http.UsuarioReferencia perfil;
            try {
                perfil = usuarios.get().uri("/usuarios/{id}", actor().usuarioId())
                        .header("X-Internal-Key", clave).retrieve().body(com.ticketuki.common.http.UsuarioReferencia.class);
            } catch (RestClientResponseException ex) {
                if (ex.getStatusCode().value() == 404) {
                    denegar();
                }
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo verificar el titular", ex);
            } catch (RestClientException ex) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo verificar el titular", ex);
            }
            if (perfil == null || !Objects.equals(perfil.id_usuario(), actor().usuarioId())
                    || perfil.run() == null || perfil.run().isBlank())
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Perfil de titular invalido");
            propio = normalizarRun(perfil.run());
            request.setAttribute(atributo, propio);
        }
        return run != null && propio.equals(normalizarRun(run));
    }

    private String normalizarRun(String run) {
        return run.replace(".", "").replace("-", "").replaceAll("\\s", "").toUpperCase(java.util.Locale.ROOT);
    }

    private void denegar() {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso sobre este recurso");
    }
}