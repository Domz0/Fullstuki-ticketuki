package com.ticketuki.eventoservice.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.Duration;

@Component
public class RecintoEventoClient {
    public record Recinto(Long id_recinto, Integer capacidad_total) {}
    private final WebClient client;
    public RecintoEventoClient(@Qualifier("recintoWebClient") WebClient client) { this.client = client; }

    public void validar(Long id, Integer aforo) {
        if (id == null || aforo == null || aforo <= 0) throw new IllegalArgumentException("Recinto y aforo son obligatorios");
        var recinto = com.ticketuki.common.http.HttpServicios.consultar(client, "/recintos/" + id, Recinto.class);
        if (!id.equals(recinto.id_recinto()) || recinto.capacidad_total() == null || recinto.capacidad_total() <= 0)
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Recinto sin datos de capacidad");
        if (aforo > recinto.capacidad_total()) throw new IllegalArgumentException("El aforo supera la capacidad del recinto");
    }
}
