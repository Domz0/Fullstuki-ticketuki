package com.ticketuki.ticketservice.service;

import com.ticketuki.ticketservice.client.ReferenciasTicketClient;
import com.ticketuki.ticketservice.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import java.util.*;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DisponibilidadEventoService {
    private final ReferenciasTicketClient referencias;
    private final TicketRepository tickets;
    private final OperacionVentaStore reservas;

    public record Sector(Long id, String nombre, String plano_id, int precio, int capacidad,
                         long emitidos, long reservados, long disponibles, String estado) {}
    public record Resumen(Long evento_id, long capacidad_total, long emitidos, long reservados,
                          long disponibles, boolean venta_habilitada, String estado, List<Sector> sectores) {}

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public Resumen consultar(Long id) {
        var evento = referencias.evento(id);
        var configurados = referencias.sectores(id);
        var sectores = new ArrayList<Sector>();
        for (var s : configurados) {
            long emitidos = tickets.contarSector(id, s.id_sector());
            long reservados = reservas.reservadosSector(id, s.id_sector());
            long disponibles = Math.max(0, s.capacidad_sector() - emitidos - reservados);
            sectores.add(new Sector(s.id_sector(), s.nombre_sector(), s.plano_id(), s.precio_sector(),
                    s.capacidad_sector(), emitidos, reservados, disponibles,
                    s.capacidad_sector() == 0 ? "CERRADO" : disponibles == 0 ? "AGOTADO" : "DISPONIBLE"));
        }
        long capacidad = sectores.stream().mapToLong(Sector::capacidad).sum();
        long emitidos = sectores.stream().mapToLong(Sector::emitidos).sum();
        long reservados = sectores.stream().mapToLong(Sector::reservados).sum();
        long disponibles = sectores.stream().mapToLong(Sector::disponibles).sum();
        boolean habilitada = Long.valueOf(2).equals(evento.estado_evento_id_estado())
                && evento.fecha_evento() != null && !evento.fecha_evento().isBefore(LocalDate.now());
        String estado = sectores.isEmpty() || capacidad == 0 ? "SIN_CONFIGURAR"
                : disponibles == 0 ? "AGOTADO" : habilitada ? "DISPONIBLE" : "NO_DISPONIBLE";
        return new Resumen(id, capacidad, emitidos, reservados, disponibles,
                habilitada && disponibles > 0, estado, sectores);
    }
}
