package com.ticketuki.ventaservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketuki.ventaservice.dto.*;
import com.ticketuki.ventaservice.pago.dto.PagoRequestDTO;
import com.ticketuki.ventaservice.pago.model.MedioPago;
import com.ticketuki.ventaservice.pago.service.PagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CompraService {
    private final com.ticketuki.common.validation.ValidacionDatos validacion;
    private final com.ticketuki.common.security.AccesoServicio acceso;
    private final JdbcTemplate jdbc;
    private final VentaService ventas;
    private final PagoService pagos;
    private final ObjectMapper mapper;

    public record Compra(Long id, Long usuario_id, Long venta_id, Long pago_id, String estado,
                         int intentos, String mensaje, String reserva_estado, java.time.LocalDateTime reserva_hasta) {}

    @Transactional
    public Compra crear(CompraRequestDTO dto) {
        validacion.validar(dto);
        acceso.propietarios(dto.venta().getDetalles().stream().map(DetalleVentaRequestDTO::getUsuario_id_usuario).toList());
        validarTitulares(dto);
        long usuario = dto.venta().getDetalles().getFirst().getUsuario_id_usuario();
        String solicitud;
        try { solicitud = mapper.writeValueAsString(dto); }
        catch (Exception ex) { throw new IllegalArgumentException("Compra inválida", ex); }
        jdbc.update("INSERT INTO compra(usuario_id, clave, solicitud, reserva_estado) VALUES (?,?,?,'PENDIENTE') ON DUPLICATE KEY UPDATE id=id",
                usuario, dto.clave(), solicitud);
        var fila = jdbc.queryForMap("SELECT id, solicitud, venta_id FROM compra WHERE usuario_id=? AND clave=? FOR UPDATE",
                usuario, dto.clave());
        long id = ((Number) fila.get("id")).longValue();
        if (!solicitud.equals(fila.get("solicitud")))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La clave de compra ya se utilizó con otros datos");
        if (fila.get("venta_id") != null) return obtener(id);
        var venta = ventas.crearVenta(dto.venta());
        var pago = pagos.procesarPago(new PagoRequestDTO(venta.getMonto_total(),
                MedioPago.valueOf(dto.venta().getMedio_pago()), dto.venta().getCod_autorizacion(), venta.getId_venta(), usuario));
        jdbc.update("UPDATE compra SET venta_id=?, pago_id=? WHERE id=?", venta.getId_venta(), pago.getId_pago(), id);
        jdbc.update("INSERT INTO pago_tarea(pago_id,tipo,estado) VALUES (?,'RESERVAR','PENDIENTE')", pago.getId_pago());
        return obtener(id);
    }

    public static void validarTitulares(CompraRequestDTO dto) {
        Map<String, Long> cantidades = new HashMap<>();
        dto.venta().getDetalles().forEach(d -> cantidades.merge(d.getEvento_id_evento()+":"+d.getSector_id_sector(),
                d.getCantidad_ticket().longValue(), Long::sum));
        Map<String, Long> titulares = new HashMap<>();
        Set<String> asientos = new HashSet<>();
        for (var t : dto.titulares()) {
            String sector = t.evento_id_evento()+":"+t.sector_id_sector();
            titulares.merge(sector, 1L, Long::sum);
            if (!asientos.add(sector+":"+t.num_asiento()))
                throw new IllegalArgumentException("No se puede repetir un asiento en la compra");
        }
        if (!cantidades.equals(titulares))
            throw new IllegalArgumentException("Debe indicar un titular y asiento por cada ticket comprado");
    }

    @Transactional(readOnly=true)
    public Compra obtener(Long id) {
        var filas = jdbc.query("""
                SELECT c.*, p.estado AS pago_estado, t.tipo, t.estado AS tarea_estado, t.intentos, t.mensaje
                FROM compra c JOIN pago p ON p.id_pago=c.pago_id
                LEFT JOIN pago_tarea t ON t.pago_id=c.pago_id WHERE c.id=?
                """, (rs,n) -> {
            String pago = rs.getString("pago_estado"), tipo = rs.getString("tipo"), tarea = rs.getString("tarea_estado");
            String estado = switch (pago) {
                case "CANCELADO" -> "CANCELADA";
                case "REEMBOLSADO" -> "REEMBOLSADA";
                case "COMPLETADO" -> "HECHA".equals(tarea) && "EMITIR".equals(tipo) ? "COMPLETADA" : "EMITIENDO";
                default -> "PENDIENTE_PAGO";
            };
            String reserva = rs.getString("reserva_estado");
            if ("PENDIENTE".equals(pago) && "PENDIENTE".equals(reserva)) estado = "RESERVANDO";
            if ("PENDIENTE".equals(tarea) && "CONFIRMAR".equals(tipo)) estado = "CONFIRMANDO_PAGO";
            if ("PENDIENTE".equals(tarea) && "CANCELAR".equals(tipo)) estado = "CANCELANDO";
            if ("PENDIENTE".equals(tarea) && "REEMBOLSAR".equals(tipo)) estado = "REEMBOLSANDO";
            if ("RECHAZADA".equals(tarea)) estado = "REVISION_REQUERIDA";
            if ("PENDIENTE".equals(pago) && "VENCIDA".equals(reserva)) estado = "RESERVA_VENCIDA";
            return new Compra(rs.getLong("id"), rs.getLong("usuario_id"), rs.getLong("venta_id"),
                    rs.getLong("pago_id"), estado, rs.getInt("intentos"), rs.getString("mensaje"), reserva,
                    rs.getTimestamp("reserva_hasta") == null ? null : rs.getTimestamp("reserva_hasta").toLocalDateTime());
        }, id);
        if (filas.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Compra no encontrada");
        acceso.propietario(filas.getFirst().usuario_id());
        return filas.getFirst();
    }
}
