package com.ticketuki.ventaservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "detalle_venta")
public class DetalleVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Long id_detalle;

    @NotNull
    @Column(name = "cantidad_ticket", nullable = false)
    private Integer cantidad_ticket;

    @NotNull
    @Column(name = "precio_neto", nullable = false)
    private Long precio_neto;

    @NotNull
    @Column(name = "precio_iva", nullable = false)
    private Long precio_iva;

    @NotNull
    @Column(name = "precio_total", nullable = false)
    private Long precio_total;

    @NotNull
    @Column(name = "comision", nullable = false)
    private Long comision;

    @NotNull
    @Column(name = "usuario_id_usuario", nullable = false)
    private Long usuario_id_usuario;

    @NotNull
    @Column(name = "venta_id_venta", nullable = false)
    private Long venta_id_venta;

    @NotNull
    @Column(name = "sector_id_sector", nullable = false)
    private Long sector_id_sector;

    @Column(name = "promocion_id")
    private Long promocion_id;

    @Column(name = "descuento_monto")
    private Long descuento_monto;

    @Column(name = "evento_id_evento")
    private Long evento_id_evento;
}
