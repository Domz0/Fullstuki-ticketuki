package com.ticketuki.ventaservice.promocion.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "promocion")
public class Promocion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_promocion")
    private Long id_promocion;

    @Column(name = "empresa", nullable = false, length = 100)
    private String empresa;

    @Column(name = "descuento", nullable = false)
    private Integer descuento;

    @Column(name = "descripcion", nullable = false, length = 255)
    private String descripcion;

    @Column(name = "restriccion", nullable = false, length = 255)
    private String restriccion;

    @Column(name = "fecha_expiracion", nullable = false)
    private LocalDate fecha_expiracion;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fecha_inicio;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime created_at;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updated_at;
}
