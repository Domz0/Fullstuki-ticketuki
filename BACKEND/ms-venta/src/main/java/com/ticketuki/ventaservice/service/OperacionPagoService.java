package com.ticketuki.ventaservice.service;

import com.ticketuki.ventaservice.pago.repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.Map;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class OperacionPagoService {
    private final com.ticketuki.common.security.AccesoServicio acceso;
    private final JdbcTemplate jdbc;
    private final PagoRepository pagos;

    @Transactional(readOnly = true)
    public Map<String,Object> obtener(Long id) {
        var pago = pagos.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pago no encontrado"));
        acceso.propietario(pago.getUsuario_id());
        var filas = jdbc.queryForList("SELECT tipo, estado, intentos, mensaje FROM pago_tarea WHERE pago_id=?", id);
        return filas.isEmpty() ? Map.of("estado", "SIN_OPERACION") : filas.getFirst();
    }

    @Transactional
    public void reintentar(Long id) {
        acceso.administrador();
        pagos.findForUpdate(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pago no encontrado"));
        jdbc.update("UPDATE pago_tarea SET estado='PENDIENTE', mensaje=NULL WHERE pago_id=? AND estado='RECHAZADA'", id);
    }
}
