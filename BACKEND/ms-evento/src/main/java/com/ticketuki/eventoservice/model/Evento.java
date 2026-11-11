package com.ticketuki.eventoservice.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@Entity
@Table(name = "evento")
public class Evento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evento")
    private Long id_evento;

    @Column(name = "nombre_evento", nullable = false, length = 100)
    private String nombre_evento;

    @Column(name = "aforo_evento", nullable = false)
    private Integer aforo_evento;

    @Column(name = "fecha_evento", nullable = false)
    private LocalDate fecha_evento;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 25)
    private EstadoEvento estado;

    @Column(name = "recinto_id_recinto")
    private Long recinto_id_recinto;

    @Column(name = "participantes", length = 500)
    private String participantes;

    public Evento(Long id_evento, String nombre_evento, Integer aforo_evento, LocalDate fecha_evento, String descripcion, Long estado_evento_id_estado, Long recinto_id_recinto, String participantes) {
        this.id_evento = id_evento;
        this.nombre_evento = nombre_evento;
        this.aforo_evento = aforo_evento;
        this.fecha_evento = fecha_evento;
        this.descripcion = descripcion;
        setEstado_evento_id_estado(estado_evento_id_estado);
        this.recinto_id_recinto = recinto_id_recinto;
        this.participantes = participantes;
    }

    public Long getEstado_evento_id_estado() {
        return estado == null ? null : estado.getId();
    }

    public void setEstado_evento_id_estado(Long id) {
        this.estado = EstadoEvento.fromId(id);
    }
}
