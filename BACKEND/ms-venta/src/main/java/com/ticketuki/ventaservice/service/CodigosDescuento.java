package com.ticketuki.ventaservice.service;

import com.ticketuki.common.security.AccesoServicio;
import com.ticketuki.ventaservice.client.CatalogoVentaClient;
import com.ticketuki.ventaservice.promocion.model.Promocion;
import com.ticketuki.ventaservice.promocion.repository.PromocionRepository;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CodigosDescuento {
    public record Nuevo(@NotNull @Positive Long evento, @NotBlank @Pattern(regexp="[A-Za-z0-9_-]{3,30}") String codigo,
                        @NotNull @Min(1) @Max(100) Integer porcentaje) {}
    private final AccesoServicio acceso;
    private final CatalogoVentaClient catalogo;
    private final PromocionRepository promociones;
    private final JdbcTemplate jdbc;

    public List<Map<String, Object>> listar() {
        acceso.administrador();
        return jdbc.queryForList("SELECT c.codigo,c.evento_id,p.descuento,p.fecha_expiracion FROM codigo_descuento c JOIN promocion p ON p.id_promocion=c.promocion_id ORDER BY p.id_promocion DESC");
    }

    @Transactional
    public Map<String, Object> crear(Nuevo dto) {
        acceso.administrador();
        var evento = catalogo.eventoDisponible(dto.evento());
        var codigo = dto.codigo().toUpperCase(Locale.ROOT);
        if (!jdbc.queryForList("SELECT codigo FROM codigo_descuento WHERE codigo=?", codigo).isEmpty())
            throw new IllegalArgumentException("Ese código ya existe");
        var promo = promociones.saveAndFlush(Promocion.builder().empresa("Ticketuki").descripcion("Código " + codigo)
                .descuento(dto.porcentaje()).restriccion("SIN_RESTRICCION")
                .fecha_inicio(LocalDate.now(ZoneId.of("America/Santiago"))).fecha_expiracion(evento.fecha_evento()).build());
        jdbc.update("INSERT INTO codigo_descuento(codigo,evento_id,promocion_id) VALUES (?,?,?)", codigo, dto.evento(), promo.getId_promocion());
        return Map.of("codigo", codigo, "evento_id", dto.evento(), "descuento", dto.porcentaje());
    }

    public Map<String, Object> consultar(String codigo, Long evento) {
        var filas = jdbc.queryForList("SELECT c.codigo,c.evento_id,c.promocion_id,p.descuento FROM codigo_descuento c JOIN promocion p ON p.id_promocion=c.promocion_id WHERE c.codigo=? AND c.evento_id=? AND ? BETWEEN p.fecha_inicio AND p.fecha_expiracion",
                codigo.trim().toUpperCase(Locale.ROOT), evento, LocalDate.now(ZoneId.of("America/Santiago")));
        if (filas.isEmpty()) throw new IllegalArgumentException("Código inválido, vencido o de otro evento");
        return filas.getFirst();
    }

    public Long promocion(String codigo, Long evento) {
        if (codigo == null || codigo.isBlank()) return null;
        return ((Number) consultar(codigo, evento).get("promocion_id")).longValue();
    }

    public void validarEvento(Long promocion, Long evento) {
        var filas = jdbc.queryForList("SELECT evento_id FROM codigo_descuento WHERE promocion_id=?", Long.class, promocion);
        if (!filas.isEmpty() && !Objects.equals(filas.getFirst(), evento))
            throw new IllegalArgumentException("El código no corresponde a este evento");
    }
}
