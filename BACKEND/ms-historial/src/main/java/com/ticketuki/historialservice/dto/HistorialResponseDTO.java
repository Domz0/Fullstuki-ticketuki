package com.ticketuki.historialservice.dto;

import com.ticketuki.historialservice.model.AccionHistorial;
import com.ticketuki.historialservice.model.TipoEntidad;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistorialResponseDTO {

    private Long id_historial;
    private TipoEntidad entidad;
    private Long id_entidad;
    private AccionHistorial accion;
    private Long usuario_id;
    private LocalDateTime timestamp;
    private String cambios_anteriores;
    private String cambios_nuevos;
    private String eventoId;
    private String origen;
    private Long authId;
}
