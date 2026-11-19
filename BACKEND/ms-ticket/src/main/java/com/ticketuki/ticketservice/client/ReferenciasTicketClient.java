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
    private final WebClient usuarios;

    public ReferenciasTicketClient(@Qualifier("eventoWebClient") WebClient eventos,
            @Qualifier("recintoWebClient") WebClient recintos, @Qualifier("ventaWebClient") WebClient ventas,
            @Qualifier("usuarioWebClient") WebClient usuarios) {
        this.eventos = eventos; this.recintos = recintos; this.ventas = ventas;
        this.usuarios = usuarios;
    }

    public record Destinatario(Long id_usuario, String run, String p_nombre, String a_paterno, String email) {}
    public Destinatario destinatario(Long id) { return get(usuarios, "/usuarios/" + id, Destinatario.class); }

    private <T> T get(WebClient client, String path, Class<T> type) {
        return com.ticketuki.common.http.HttpServicios.consultar(client, path, type);
    }

    public void validarRelacion(Long eventoId, Long sectorId) {
        var evento = evento(eventoId);
        var sector = sector(eventoId, sectorId);
        if (!java.util.Objects.equals(evento.id_evento(), eventoId)
                || !java.util.Objects.equals(sector.id_sector(), sectorId))
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Referencia de evento o sector invalida");
        if (evento.recinto_id_recinto() == null || !java.util.Objects.equals(evento.recinto_id_recinto(), sector.recinto_id_recinto()))
            throw new IllegalArgumentException("El sector no pertenece al recinto del evento");
    }

    public Evento evento(Long id) { return get(eventos, "/eventos/" + id, Evento.class); }
    public Sector sector(Long evento, Long id) { return get(eventos, "/eventos/" + evento + "/sectores/" + id, Sector.class); }
    public SectorDetalle[] sectores(Long evento) { return get(eventos, "/eventos/" + evento + "/sectores", SectorDetalle[].class); }
    public record SectorDetalle(Long id_sector, String nombre_sector, int capacidad_sector, int precio_sector, Long recinto_id_recinto, String plano_id) {}
    public Venta venta(Long id) { return get(ventas, "/ventas/" + id, Venta.class); }
}
