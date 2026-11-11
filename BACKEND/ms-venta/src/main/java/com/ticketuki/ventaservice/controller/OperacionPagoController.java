package com.ticketuki.ventaservice.controller;

import com.ticketuki.ventaservice.pago.repository.PagoRepository;
import com.ticketuki.ventaservice.security.CompradorRequest;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.Map;

@RestController
@RequestMapping("/pagos")
@RequiredArgsConstructor
public class OperacionPagoController {
    private final JdbcTemplate jdbc;
    private final PagoRepository pagos;

    @GetMapping("/{id}/operacion")
    public Map<String,Object> obtener(@PathVariable Long id, HttpServletRequest request) {
        var pago = pagos.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pago no encontrado"));
        CompradorRequest.validar(request, pago.getUsuario_id());
        var filas = jdbc.queryForList("SELECT tipo, estado, intentos, mensaje FROM pago_tarea WHERE pago_id=?", id);
        return filas.isEmpty() ? Map.of("estado", "SIN_OPERACION") : filas.getFirst();
    }

    @PostMapping("/{id}/reintentar")
    @Transactional
    public void reintentar(@PathVariable Long id, HttpServletRequest request) {
        if (!"ADMIN".equals(request.getHeader("X-Rol")))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo ADMIN puede reintentar una operación rechazada");
        pagos.findForUpdate(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pago no encontrado"));
        jdbc.update("UPDATE pago_tarea SET estado='PENDIENTE', mensaje=NULL WHERE pago_id=? AND estado='RECHAZADA'", id);
    }
}
