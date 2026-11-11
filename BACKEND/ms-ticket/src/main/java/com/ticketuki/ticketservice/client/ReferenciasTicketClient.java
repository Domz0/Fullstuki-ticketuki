package com.ticketuki.ticketservice.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.*;
import java.util.List;

@Component
public class ReferenciasTicketClient {
    public record Evento(Long id_evento, Integer aforo_evento, LocalDate fecha_evento,
                         Long estado_evento_id_estado, Long recinto_id_recinto) {}
    public record Sector(Long id_sector, Integer capacidad_sector, Long recinto_id_recinto) {}
    public record Estado(Long id, String nombre) {}
    public record Detalle(Integer cantidad_ticket, Long sector_id_sector, Long evento_id_evento) {}
    public record Venta(Long id_venta, Estado estado_venta, List<Detalle> detalles) {}
    private final WebClient eventos;
    private final WebClient recintos;
    private final WebClient ventas;

    public ReferenciasTicketClient(@Qualifier("eventoWebClient") WebClient eventos,
            @Qualifier("recintoWebClient") WebClient recintos, @Qualifier("ventaWebClient") WebClient ventas) {
        this.eventos = eventos; this.recintos = recintos; this.ventas = ventas;
    }

    private <T> T get(WebClient client, String path, Class<T> type) {
        try {
            T value = client.get().uri(path).retrieve().bodyToMono(type).block(Duration.ofSeconds(5));
            if (value == null) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Referencia vacía");
            return value;
        } catch (WebClientResponseException.NotFound ex) {
            throw new IllegalArgumentException("Referencia no encontrada: " + path);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo comprobar la referencia", ex);
        }
    }

    public Evento evento(Long id) { return get(eventos, "/eventos/" + id, Evento.class); }
    public Sector sector(Long id) { return get(recintos, "/sectores/" + id, Sector.class); }
    public Venta venta(Long id) { return get(ventas, "/ventas/" + id, Venta.class); }
}
