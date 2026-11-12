package com.ticketuki.ventaservice.client;

import com.ticketuki.ventaservice.dto.DetalleVentaRequestDTO;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.Objects;

@Component
public class CatalogoVentaClient {
    public record Sector(Long id_sector, Integer precio_sector, Integer capacidad_sector, Long recinto_id_recinto) {}
    public record Evento(Long id_evento, Integer aforo_evento, LocalDate fecha_evento, Long estado_evento_id_estado, Long recinto_id_recinto) {}
    public record Disponibilidad(Long emitidos_evento, Long emitidos_sector, Long reservados_evento, Long reservados_sector) {}
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
        return com.ticketuki.common.http.HttpServicios.consultar(client, path, type);
    }

    public void validarUsuario(Long id) {
        var usuario = consultar(usuarios, "/usuarios/" + id, com.ticketuki.common.http.UsuarioReferencia.class);
        if (id == null || !Objects.equals(usuario.id_usuario(), id))
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
        if (detalles == null || detalles.isEmpty()) throw new IllegalArgumentException("Debe indicar detalles");
        for (var detalle : detalles) {
            if (detalle == null || detalle.getCantidad_ticket() == null || detalle.getCantidad_ticket() <= 0
                    || detalle.getEvento_id_evento() == null || detalle.getSector_id_sector() == null)
                throw new IllegalArgumentException("Detalle de compra invalido");
            cantidades.merge(new Grupo(detalle.getEvento_id_evento(), detalle.getSector_id_sector()), detalle.getCantidad_ticket().longValue(), Math::addExact);
            porEvento.merge(detalle.getEvento_id_evento(), detalle.getCantidad_ticket().longValue(), Math::addExact);
        }
        for (var entry : cantidades.entrySet()) {
            var grupo = entry.getKey();
            var evento = consultar(eventos, "/eventos/" + grupo.evento(), Evento.class);
            var sector = consultar(recintos, "/sectores/" + grupo.sector(), Sector.class);
            if (!Objects.equals(evento.id_evento(), grupo.evento()) || !Objects.equals(sector.id_sector(), grupo.sector()))
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Catalogo de disponibilidad invalido");
            if (evento.recinto_id_recinto() == null || !Objects.equals(evento.recinto_id_recinto(), sector.recinto_id_recinto()))
                throw new IllegalArgumentException("El sector no pertenece al recinto del evento");
            var usados = consultar(tickets, "/tickets/disponibilidad/" + grupo.evento() + "/" + grupo.sector(), Disponibilidad.class);
            if (evento.aforo_evento() == null || sector.capacidad_sector() == null
                    || usados.emitidos_evento() == null || usados.emitidos_sector() == null
                    || usados.reservados_evento() == null || usados.reservados_sector() == null
                    || usados.emitidos_evento() < 0 || usados.emitidos_sector() < 0
                    || usados.reservados_evento() < 0 || usados.reservados_sector() < 0)
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Disponibilidad sin datos");
            if (usados.emitidos_evento() + usados.reservados_evento() + porEvento.get(grupo.evento()) > evento.aforo_evento()
                    || usados.emitidos_sector() + usados.reservados_sector() + entry.getValue() > sector.capacidad_sector())
                throw new IllegalArgumentException("La compra supera los cupos disponibles");
        }
    }
}
