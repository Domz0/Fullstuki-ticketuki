package com.ticketuki.ventaservice.client;

import com.ticketuki.ventaservice.dto.DetalleVentaRequestDTO;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.Objects;
import com.fasterxml.jackson.databind.JsonNode;

@Component
public class CatalogoVentaClient {
    public record Sector(Long id_sector, Integer precio_sector, Integer capacidad_sector, Long recinto_id_recinto) {}
    public record Evento(Long id_evento, Integer aforo_evento, LocalDate fecha_evento, Long estado_evento_id_estado, Long recinto_id_recinto) {}
    private final WebClient recintos;
    private final WebClient eventos;
    private final WebClient usuarios;
    private final WebClient tickets;

    public CatalogoVentaClient(@Qualifier("recintoWebClient") WebClient recintos,
                               @Qualifier("eventoWebClient") WebClient eventos,
                               @Qualifier("usuarioWebClient") WebClient usuarios,
                               @Qualifier("ticketWebClient") WebClient tickets) {
        this.recintos = recintos;
        this.eventos = eventos;
        this.usuarios = usuarios;
        this.tickets = tickets;
    }

    private <T> T consultar(WebClient client, String path, Class<T> type) {
        try {
            T resultado = client.get().uri(path).retrieve().bodyToMono(type).block(Duration.ofSeconds(5));
            if (resultado == null) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Referencia sin datos");
            return resultado;
        } catch (WebClientResponseException.NotFound ex) {
            throw new IllegalArgumentException("Referencia no encontrada: " + path);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo comprobar el catálogo", ex);
        }
    }

    public void validarUsuario(Long id) {
        var usuario = consultar(usuarios, "/usuarios/" + id, JsonNode.class);
        if (usuario.path("id_usuario").asLong(-1) != id)
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Usuario de referencia inválido");
    }

    public long precioPara(DetalleVentaRequestDTO dto) {
        var sector = consultar(recintos, "/sectores/" + dto.getSector_id_sector(), Sector.class);
        var evento = consultar(eventos, "/eventos/" + dto.getEvento_id_evento(), Evento.class);
        if (!Objects.equals(sector.id_sector(), dto.getSector_id_sector())
                || !Objects.equals(evento.id_evento(), dto.getEvento_id_evento()))
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Referencia de catálogo inválida");
        if (sector.recinto_id_recinto() == null || !Objects.equals(sector.recinto_id_recinto(), evento.recinto_id_recinto()))
            throw new IllegalArgumentException("El sector no pertenece al recinto del evento");
        if (!Long.valueOf(2).equals(evento.estado_evento_id_estado()) || evento.fecha_evento() == null
                || evento.fecha_evento().isBefore(LocalDate.now()))
            throw new IllegalArgumentException("El evento no está disponible para venta");
        if (sector.precio_sector() == null || sector.precio_sector() < 0
                || sector.capacidad_sector() == null || evento.aforo_evento() == null)
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Precio o capacidad sin configurar");
        if (dto.getCantidad_ticket() > sector.capacidad_sector() || dto.getCantidad_ticket() > evento.aforo_evento())
            throw new IllegalArgumentException("La cantidad supera la capacidad del sector o evento");
        return sector.precio_sector().longValue();
    }

    public void validarCupos(java.util.List<DetalleVentaRequestDTO> detalles) {
        record Grupo(Long evento, Long sector) {}
        var cantidades = new java.util.HashMap<Grupo, Long>();
        var porEvento = new java.util.HashMap<Long, Long>();
        for (var detalle : detalles) {
            cantidades.merge(new Grupo(detalle.getEvento_id_evento(), detalle.getSector_id_sector()), detalle.getCantidad_ticket().longValue(), Math::addExact);
            porEvento.merge(detalle.getEvento_id_evento(), detalle.getCantidad_ticket().longValue(), Math::addExact);
        }
        for (var entry : cantidades.entrySet()) {
            var grupo = entry.getKey();
            var evento = consultar(eventos, "/eventos/" + grupo.evento(), Evento.class);
            var sector = consultar(recintos, "/sectores/" + grupo.sector(), Sector.class);
            var usados = consultar(tickets, "/tickets/disponibilidad/" + grupo.evento() + "/" + grupo.sector(), JsonNode.class);
            if (evento.aforo_evento() == null || sector.capacidad_sector() == null
                    || !usados.hasNonNull("emitidos_evento") || !usados.hasNonNull("emitidos_sector"))
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Disponibilidad sin datos");
            if (usados.path("emitidos_evento").asLong() + usados.path("reservados_evento").asLong() + porEvento.get(grupo.evento()) > evento.aforo_evento()
                    || usados.path("emitidos_sector").asLong() + usados.path("reservados_sector").asLong() + entry.getValue() > sector.capacidad_sector())
                throw new IllegalArgumentException("La compra supera los cupos disponibles");
        }
    }
}
