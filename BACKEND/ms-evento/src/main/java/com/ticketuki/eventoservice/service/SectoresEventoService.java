package com.ticketuki.eventoservice.service;

import java.util.*;
import com.ticketuki.eventoservice.client.RecintoEventoClient;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class SectoresEventoService {
    private final JdbcTemplate jdbc;
    private final RecintoEventoClient recintos;

    public record Configuracion(@NotNull @Positive Long sector_id,
            @NotNull @PositiveOrZero Integer capacidad, @NotNull @PositiveOrZero Integer precio) {}
    public record Sector(Long id_sector, String nombre_sector, int capacidad_sector,
            int precio_sector, Long recinto_id_recinto, String plano_id) {}

    public List<Sector> listar(Long evento) {
        return jdbc.query("""
            SELECT s.sector_id, s.nombre, s.capacidad, s.precio, e.recinto_id_recinto, s.plano_id
            FROM evento_sector s JOIN evento e ON e.id_evento=s.evento_id
            WHERE s.evento_id=? ORDER BY s.sector_id
            """, (rs,n) -> new Sector(rs.getLong(1), rs.getString(2), rs.getInt(3),
                rs.getInt(4), rs.getLong(5), rs.getString(6)), evento);
    }

    public Sector obtener(Long evento, Long sector) {
        return listar(evento).stream().filter(s -> s.id_sector().equals(sector)).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sector no configurado para este evento"));
    }

    public int capacidadTotal(Long evento) {
        return listar(evento).stream().mapToInt(Sector::capacidad_sector).reduce(0, Math::addExact);
    }

    public List<Sector> preparar(Long recinto, List<Configuracion> configuracion) {
        if (configuracion == null || configuracion.isEmpty())
            throw new IllegalArgumentException("Configura los sectores del evento");
        var ids = new HashSet<Long>();
        var resultado = new ArrayList<Sector>();
        for (var c : configuracion) {
            if (c == null || c.sector_id() == null || c.capacidad() == null || c.precio() == null
                    || c.capacidad() < 0 || c.precio() < 0 || !ids.add(c.sector_id()))
                throw new IllegalArgumentException("Configuracion de sectores invalida o repetida");
            var fisico = recintos.sector(c.sector_id());
            if (!Objects.equals(recinto, fisico.recinto_id_recinto()) || fisico.capacidad_sector() == null
                    || c.capacidad() > fisico.capacidad_sector())
                throw new IllegalArgumentException("El sector no pertenece al recinto o excede su capacidad fisica");
            resultado.add(new Sector(c.sector_id(), fisico.nombre_sector(), c.capacidad(), c.precio(), recinto, null));
        }
        recintos.validar(recinto, resultado.stream().mapToInt(Sector::capacidad_sector).reduce(0, Math::addExact));
        return resultado;
    }

    public void crear(Long evento, List<Sector> sectores) {
        for (var s : sectores) jdbc.update("""
            INSERT INTO evento_sector(evento_id,sector_id,nombre,capacidad,precio,plano_id) VALUES (?,?,?,?,?,?)
            """, evento, s.id_sector(), s.nombre_sector(), s.capacidad_sector(), s.precio_sector(), s.plano_id());
    }
}
