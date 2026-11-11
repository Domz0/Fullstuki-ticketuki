package com.ticketuki.gateway.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.*;
import reactor.core.publisher.Mono;
import java.time.Duration;

@Component
public class SesionActivaClient {
    private final WebClient client;
    private final String key;
    public SesionActivaClient(WebClient.Builder builder, @Value("${MS_AUTH_URL:http://localhost:8011}") String url,
            @Value("${INTERNAL_SERVICE_KEY:}") String key) {
        client = builder.baseUrl(url).build();
        this.key = key;
    }
    public Mono<Boolean> validar(String token) {
        if (key.isBlank()) return Mono.error(new IllegalStateException("Falta INTERNAL_SERVICE_KEY"));
        return client.post().uri("/interno/sesiones/validar").header("X-Internal-Key", key)
            .header("Authorization", token).retrieve().toBodilessEntity().map(response -> true)
            .timeout(Duration.ofSeconds(5))
            .onErrorResume(WebClientResponseException.Unauthorized.class, ex -> Mono.just(false));
    }
}
