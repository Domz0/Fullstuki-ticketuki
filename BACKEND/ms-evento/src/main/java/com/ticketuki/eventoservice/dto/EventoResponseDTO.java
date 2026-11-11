package com.ticketuki.eventoservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventoResponseDTO {
    private Long id_evento;
    private String nombre_evento;
    private Integer aforo_evento;
    private LocalDate fecha_evento;
    private String descripcion;
    private Long estado_evento_id_estado;
    private Long recinto_id_recinto;
    private String participantes;
}
