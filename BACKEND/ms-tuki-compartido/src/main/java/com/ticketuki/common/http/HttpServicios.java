package com.ticketuki.common.http;

import io.netty.channel.ChannelOption;
import io.netty.resolver.DefaultAddressResolverGroup;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import java.time.Duration;

public final class HttpServicios {
    public static final int CONEXION_MS = 3000;
    public static final Duration RESPUESTA = Duration.ofSeconds(5);
    private HttpServicios() {}

    public static WebClient.Builder configurar(WebClient.Builder builder, String clave) {
        var http = HttpClient.create().resolver(DefaultAddressResolverGroup.INSTANCE)
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, CONEXION_MS).responseTimeout(RESPUESTA);
        builder.clientConnector(new ReactorClientHttpConnector(http));
        if (clave != null && !clave.isBlank()) builder.defaultHeader("X-Internal-Key", clave);
        return builder;
    }

    public static WebClient.Builder builder(String clave) {
        return configurar(WebClient.builder(), clave);
    }

    public static <T> T consultar(WebClient client, String ruta, Class<T> tipo) {
        try {
            return ejecutar(client.get().uri(ruta).retrieve().bodyToMono(tipo), tipo);
        } catch (WebClientResponseException.NotFound ex) {
            throw new IllegalArgumentException("Referencia no encontrada: " + ruta);
        } catch (WebClientResponseException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo consultar el servicio", ex);
        }
    }

    public static <T> T ejecutar(Mono<T> respuesta, Class<T> tipo) {
        try {
            T valor = respuesta.timeout(RESPUESTA).block(RESPUESTA.plusSeconds(1));
            if (valor == null && tipo != Void.class)
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Respuesta remota vacia");
            return valor;
        } catch (WebClientResponseException | ResponseStatusException ex) {
            throw ex;
        } catch (org.springframework.core.codec.CodecException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Respuesta remota invalida", ex);
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Servicio remoto no disponible", ex);
        }
    }
}