package com.ticketuki.gateway.security;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.*;
import reactor.core.publisher.Mono;
import java.time.Duration;

@Component
public class AccesoCliente {
    private final WebClient usuarios;
    private final WebClient ventas;
    private final WebClient tickets;

    public AccesoCliente(WebClient.Builder builder,
                         @Value("${ms.usuario.url:http://localhost:8001}") String usuarioUrl,
                         @Value("${ms.venta.url:http://localhost:8006}") String ventaUrl,
                         @Value("${ms.ticket.url:http://localhost:8005}") String ticketUrl) {
        usuarios = builder.clone().baseUrl(usuarioUrl).build();
        ventas = builder.clone().baseUrl(ventaUrl).build();
        tickets = builder.clone().baseUrl(ticketUrl).build();
    }

    private Mono<JsonNode> get(WebClient client, String path) {
        return client.get().uri(path).retrieve().bodyToMono(JsonNode.class).timeout(Duration.ofSeconds(5))
                .onErrorResume(WebClientResponseException.NotFound.class, ex -> Mono.empty());
    }

    private boolean mismoUsuario(JsonNode node, String campo, long id) {
        return node.hasNonNull(campo) && node.path(campo).asLong(-1) == id;
    }

    private Mono<Boolean> ventaPropia(String id, long usuarioId) {
        return get(ventas, "/ventas/" + id).map(v -> {
            JsonNode detalles = v.path("detalles");
            if (!detalles.isArray() || detalles.isEmpty()) return false;
            for (JsonNode detalle : detalles)
                if (!mismoUsuario(detalle, "usuario_id_usuario", usuarioId)) return false;
            return true;
        }).defaultIfEmpty(false);
    }

    public Mono<Boolean> permite(String path, Long usuarioId) {
        if (usuarioId == null || usuarioId <= 0) return Mono.just(false);
        if (path.matches("/tickets/disponibilidad/[0-9]+/[0-9]+")) return Mono.just(true);
        String[] partes = path.split("/");
        if (path.startsWith("/usuarios/")) return Mono.just(path.equals("/usuarios/" + usuarioId));
        if (path.matches("/compras/[0-9]+"))
            return ventas.get().uri(path).header("X-Rol", "CLIENTE").header("X-Usuario-Id", usuarioId.toString())
                    .retrieve().bodyToMono(JsonNode.class).timeout(Duration.ofSeconds(5))
                    .map(c -> mismoUsuario(c, "usuario_id", usuarioId))
                    .onErrorResume(WebClientResponseException.NotFound.class, ex -> Mono.just(false))
                    .onErrorResume(WebClientResponseException.Forbidden.class, ex -> Mono.just(false))
                    .defaultIfEmpty(false);
        if (path.matches("/tickets/venta/[0-9]+")) return ventaPropia(partes[3], usuarioId);
        if (path.matches("/ventas/[0-9]+")) return ventaPropia(partes[2], usuarioId);
        if (path.startsWith("/detalleVenta/venta/") || path.startsWith("/pagos/venta/"))
            return ventaPropia(partes[3], usuarioId);
        if (path.matches("/detalleVenta/[0-9]+"))
            return get(ventas, path).map(d -> mismoUsuario(d, "usuario_id_usuario", usuarioId)).defaultIfEmpty(false);
        if (path.startsWith("/pagos/usuario/"))
            return Mono.just(path.equals("/pagos/usuario/" + usuarioId));
        if (path.matches("/pagos/[0-9]+(/cancelar|/operacion)?"))
            return get(ventas, "/pagos/" + partes[2]).map(p -> mismoUsuario(p, "usuario_id", usuarioId)).defaultIfEmpty(false);
        if (path.startsWith("/tickets/")) {
            return get(usuarios, "/usuarios/" + usuarioId).flatMap(u -> {
                String run = u.path("run").asText("");
                if (run.isBlank()) return Mono.just(false);
                if (path.startsWith("/tickets/titular/")) return Mono.just(run.equalsIgnoreCase(partes[3]));
                return get(tickets, "/tickets/" + partes[2])
                        .map(t -> run.equalsIgnoreCase(t.path("run_titular").asText("")));
            }).defaultIfEmpty(false);
        }
        return Mono.just(true);
    }
}
