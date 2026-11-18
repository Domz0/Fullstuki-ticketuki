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
    private String categoria;
    private String subcategoria;
    private String ciudad;
    private String recinto_catalogo;
    private Integer precio_desde;
    private String horario;
    private String fecha_visible;
    private String disponibilidad;
    private Integer plazo;

    public EventoResponseDTO(Long id, String nombre, Integer aforo, java.time.LocalDate fecha, String descripcion, Long estado, Long recinto, String participantes) {
        this.id_evento = id; this.nombre_evento = nombre; this.aforo_evento = aforo;
        this.fecha_evento = fecha; this.descripcion = descripcion; this.estado_evento_id_estado = estado;
        this.recinto_id_recinto = recinto; this.participantes = participantes;
    }

}
