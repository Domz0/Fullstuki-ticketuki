package com.ticketuki.ventaservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketuki.ventaservice.dto.*;
import com.ticketuki.ventaservice.client.TicketsCompraClient;
import com.ticketuki.ventaservice.pago.model.*;
import com.ticketuki.ventaservice.pago.repository.PagoRepository;
import com.ticketuki.ventaservice.pago.service.PagoService;
import com.ticketuki.common.security.AccesoServicio;
import com.ticketuki.common.validation.ValidacionDatos;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
@RequiredArgsConstructor
public class CompraPublicaService {
    private final JdbcTemplate jdbc;
    private final CompraService compras;
    private final VentaService ventas;
    private final PagoRepository pagos;
    private final PagoService pagoService;
    private final TicketsCompraClient tickets;
    private final ObjectMapper mapper;
    private final AccesoServicio acceso;
    private final ValidacionDatos validacion;
    private final CodigosDescuento codigos;

    private String hash(String secreto) {
        if (secreto == null || !secreto.matches("[a-f0-9]{64}"))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso a compra inválido");
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(secreto.getBytes(StandardCharsets.UTF_8))); }
        catch (java.security.NoSuchAlgorithmException ex) { throw new IllegalStateException(ex); }
    }

    private void verificar(Long id, String secreto) {
        String recibido = hash(secreto);
        var hashes = jdbc.queryForList("SELECT acceso_hash FROM compra WHERE id=?", String.class, id);
        if (hashes.isEmpty() || hashes.getFirst() == null || !MessageDigest.isEqual(
                recibido.getBytes(StandardCharsets.UTF_8), hashes.getFirst().getBytes(StandardCharsets.UTF_8)))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso a compra inválido");
    }

    @Transactional
    public CompraService.Compra crear(CompraPublicaDTO dto, String secreto, boolean conSesion) {
        validacion.validar(dto);
        String huella = hash(secreto);
        Long usuario = conSesion ? acceso.actor().usuarioId() : null;
        var detalle = new DetalleVentaRequestDTO(dto.cantidad(), null, usuario, dto.sector(), codigos.promocion(dto.codigo(), dto.evento()), dto.evento());
        var ventaDto = new VentaRequestDTO(dto.medio().name(), "SIM-" + dto.clave().substring(0, Math.min(46, dto.clave().length())), null, List.of(detalle));
        var titulares = java.util.stream.IntStream.range(0, dto.cantidad()).mapToObj(i ->
                new CompraRequestDTO.Titular(dto.evento(), dto.sector(), dto.nombre(), dto.rut())).toList();
        String solicitud;
        try { solicitud = mapper.writeValueAsString(new CompraRequestDTO(dto.clave(), ventaDto, titulares)); }
        catch (Exception ex) { throw new IllegalArgumentException("Compra inválida", ex); }
        jdbc.update("""
                INSERT INTO compra(usuario_id,clave,solicitud,nombre_comprador,rut_comprador,correo_comprador,acceso_hash,origen,reserva_estado)
                VALUES (?,?,?,?,?,?,?,?,'PENDIENTE') ON DUPLICATE KEY UPDATE id=id
                """, usuario, dto.clave(), solicitud, dto.nombre(), dto.rut(), dto.correo(), huella, conSesion ? "CUENTA" : "INVITADO");
        var fila = jdbc.queryForMap("SELECT id,solicitud,correo_comprador,venta_id FROM compra WHERE clave=? FOR UPDATE", dto.clave());
        Long id = ((Number)fila.get("id")).longValue();
        verificar(id, secreto);
        if (!solicitud.equals(fila.get("solicitud")) || !dto.correo().equals(fila.get("correo_comprador")))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La compra ya existe con otros datos");
        if (fila.get("venta_id") != null) return compras.consultar(id);
        var venta = ventas.crearVentaCompra(ventaDto);
        var pago = pagos.save(new Pago(null, venta.getMonto_total(), dto.medio(), ventaDto.getCod_autorizacion(),
                java.time.LocalDateTime.now(), EstadoPago.PENDIENTE, venta.getId_venta(), usuario));
        jdbc.update("UPDATE compra SET venta_id=?,pago_id=? WHERE id=?", venta.getId_venta(), pago.getId_pago(), id);
        jdbc.update("INSERT INTO pago_tarea(pago_id,tipo,estado) VALUES (?,'RESERVAR','PENDIENTE')", pago.getId_pago());
        return compras.consultar(id);
    }

    @Transactional(readOnly=true)
    public CompraService.Compra obtener(Long id, String secreto) {
        verificar(id, secreto);
        return compras.consultar(id);
    }

    @Transactional(readOnly=true)
    public CompraService.Compra porClave(String clave, String secreto) {
        hash(secreto);
        var ids = jdbc.queryForList("SELECT id FROM compra WHERE clave=?", Long.class, clave);
        if (ids.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "La compra aún no fue registrada");
        return obtener(ids.getFirst(), secreto);
    }

    public Map<String, Object> invitadosDebug(int pagina) {
        acceso.administrador();
        if (pagina < 0 || pagina > 100000) throw new IllegalArgumentException("Página inválida");
        var filas = jdbc.queryForList("""
            SELECT c.id, c.venta_id, c.nombre_comprador, c.rut_comprador, c.correo_comprador,
                   v.fecha_venta, v.estado, v.monto_total
            FROM compra c JOIN venta v ON v.id_venta=c.venta_id
            WHERE c.origen = 'INVITADO' ORDER BY c.id DESC LIMIT 20 OFFSET ?
            """, pagina * 20);
        for (var fila : filas) fila.put("tickets", tickets.listar(((Number)fila.get("venta_id")).longValue()));
        Long total = jdbc.queryForObject("SELECT COUNT(*) FROM compra WHERE origen = 'INVITADO' AND venta_id IS NOT NULL", Long.class);
        return Map.of("compras", filas, "total", total, "pagina", pagina);
    }

    @Transactional
    public CompraService.Compra confirmar(Long id, String secreto) {
        verificar(id, secreto);
        pagoService.simularCompraValidada(compras.consultar(id).pago_id());
        return compras.consultar(id);
    }

    public Map<String,Object> resultado(Long id, String secreto) {
        var compra = obtener(id, secreto);
        if (!"COMPLETADA".equals(compra.estado()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La compra aún no está completada");
        Long total = jdbc.queryForObject("SELECT monto_total FROM venta WHERE id_venta=?", Long.class, compra.venta_id());
        var comprador = jdbc.queryForMap("SELECT nombre_comprador, rut_comprador FROM compra WHERE id=?", id);
        return Map.of("venta_id", compra.venta_id(), "total", total, "tickets", tickets.listar(compra.venta_id()),
                "comprador", comprador,
                "medio_pago", jdbc.queryForObject("SELECT medio_pago FROM venta WHERE id_venta=?", String.class, compra.venta_id()),
                "correo", jdbc.queryForObject("SELECT correo_comprador FROM compra WHERE id=?", String.class, id),
                "correo_enviado", false);
    }
}
