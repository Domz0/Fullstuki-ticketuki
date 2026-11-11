package com.ticketuki.ventaservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@Entity
@Table(name = "venta")
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_venta")
    private Long id_venta;

    @NotNull(message = "La fecha de venta es requerida")
    @Column(name = "fecha_venta", nullable = false)
    private LocalDateTime fecha_venta;

    @NotBlank(message = "El medio de pago es requerido")
    @Column(name = "medio_pago", nullable = false, length = 50)
    private String medio_pago;

    @NotBlank(message = "El código de autorización es requerido")
    @Size(max = 50, message = "El código de autorización no puede superar los 50 caracteres")
    @Column(name = "cod_autorizacion", nullable = false, length = 50)
    private String cod_autorizacion;

    @NotNull(message = "El monto total es requerido")
    @Column(name = "monto_total", nullable = false)
    private Long monto_total;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 25)
    private EstadoVenta estado;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime created_at;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updated_at;

    public Venta(Long id_venta, LocalDateTime fecha_venta, String medio_pago, String cod_autorizacion, Long monto_total, Long estado_venta_id_estado, LocalDateTime created_at, LocalDateTime updated_at) {
        this.id_venta = id_venta;
        this.fecha_venta = fecha_venta;
        this.medio_pago = medio_pago;
        this.cod_autorizacion = cod_autorizacion;
        this.monto_total = monto_total;
        setEstado_venta_id_estado(estado_venta_id_estado);
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    public Long getEstado_venta_id_estado() {
        return estado == null ? null : estado.getId();
    }

    public void setEstado_venta_id_estado(Long id) {
        this.estado = EstadoVenta.fromId(id);
    }
}
