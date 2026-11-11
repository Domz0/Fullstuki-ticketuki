package com.ticketuki.recintoservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "sector")
public class Sector {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    @Column(name = "id_sector")
    private Long id_sector;

    @NotBlank(message = "El nombre del sector es requerido")
    @Column(name = "nombre_sector", nullable = false, length = 25)
    private String nombre_sector;

    @Column(name = "capacidad_sector", nullable = false)
    private Integer capacidad_sector;

    @Column(name = "precio_sector", nullable = false)
    private Integer precio_sector;

    @Column(name = "recinto_id_recinto", nullable = false)
    private Long recinto_id_recinto;

    @Version
    private Long version;

    public Sector(Long id_sector, String nombre_sector, Integer capacidad_sector, Integer precio_sector, Long recinto_id_recinto) {
        this.id_sector = id_sector;
        this.nombre_sector = nombre_sector;
        this.capacidad_sector = capacidad_sector;
        this.precio_sector = precio_sector;
        this.recinto_id_recinto = recinto_id_recinto;
    }
}
