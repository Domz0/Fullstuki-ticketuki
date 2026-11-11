package com.ticketuki.eventoservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(name = "estado_evento_id_estado")
    private Long estado_evento_id_estado;

    @Column(name = "recinto_id_recinto")
    private Long recinto_id_recinto;

    @Column(name = "participantes", length = 500)
    private String participantes;
}
