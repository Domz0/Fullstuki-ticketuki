package com.ticketuki.ventaservice.pago.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pago")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Long id_pago;

    @Column(name = "monto", nullable = false)
    private Long monto;

    @Enumerated(EnumType.STRING)
    @Column(name = "medio_pago", length = 50)
    private MedioPago medio_pago;

    @Column(name = "cod_autorizacion", nullable = false, length = 50)
    private String cod_autorizacion;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 25, nullable = false)
    private EstadoPago estado;

    @Column(name = "venta_id")
    private Long venta_id;

    @Column(name = "usuario_id")
    private Long usuario_id;
}
