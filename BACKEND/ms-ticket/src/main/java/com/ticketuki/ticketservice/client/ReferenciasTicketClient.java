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
    public record Detalle(Integer cantidad_ticket, Long sector_id_sector, Long evento_id_evento, Long usuario_id_usuario) {}
    public record Venta(Long id_venta, Estado estado_venta, List<Detalle> detalles) {}
    private final WebClient eventos;
    private final WebClient recintos;
    private final WebClient ventas;

    public ReferenciasTicketClient(@Qualifier("eventoWebClient") WebClient eventos,
            @Qualifier("recintoWebClient") WebClient recintos, @Qualifier("ventaWebClient") WebClient ventas) {
        this.eventos = eventos; this.recintos = recintos; this.ventas = ventas;
    }

    private <T> T get(WebClient client, String path, Class<T> type) {
        return com.ticketuki.common.http.HttpServicios.consultar(client, path, type);
    }

    public void validarRelacion(Long eventoId, Long sectorId) {
        var evento = evento(eventoId);
        var sector = sector(sectorId);
        if (!java.util.Objects.equals(evento.id_evento(), eventoId)
                || !java.util.Objects.equals(sector.id_sector(), sectorId))
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Referencia de evento o sector invalida");
        if (evento.recinto_id_recinto() == null || !java.util.Objects.equals(evento.recinto_id_recinto(), sector.recinto_id_recinto()))
            throw new IllegalArgumentException("El sector no pertenece al recinto del evento");
    }

    public Evento evento(Long id) { return get(eventos, "/eventos/" + id, Evento.class); }
    public Sector sector(Long id) { return get(recintos, "/sectores/" + id, Sector.class); }
    public Venta venta(Long id) { return get(ventas, "/ventas/" + id, Venta.class); }
}
