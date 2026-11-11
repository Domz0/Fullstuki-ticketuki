package com.ticketuki.ticketservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@Entity
@Table(name = "ticket", uniqueConstraints = {
        @UniqueConstraint(name = "uq_asiento_evento_sector",
                columnNames = {"num_asiento", "evento_id_evento", "sector_id_sector"})
})
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ticket")
    private Long id_ticket;

    @NotBlank(message = "El código QR es requerido")
    @Column(name = "cod_qr", nullable = false, unique = true, length = 10)
    private String cod_qr;

    @NotNull(message = "El número de asiento es requerido")
    @Column(name = "num_asiento", nullable = false)
    private Integer num_asiento;

    @NotBlank(message = "El nombre del titular es requerido")
    @Column(name = "nombre_titular", nullable = false, length = 50)
    private String nombre_titular;

    @NotBlank(message = "El RUN del titular es requerido")
    @Column(name = "run_titular", nullable = false, length = 12)
    private String run_titular;

    @NotNull(message = "La fecha de emisión es requerida")
    @Column(name = "fecha_emision", nullable = false)
    private LocalDate fecha_emision;

    @Column(name = "venta_id_venta")
    private Long venta_id_venta;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 25)
    private EstadoTicket estado;

    @Column(name = "evento_id_evento")
    private Long evento_id_evento;

    @Column(name = "sector_id_sector")
    private Long sector_id_sector;

    public Ticket(Long id_ticket, String cod_qr, Integer num_asiento, String nombre_titular, String run_titular, LocalDate fecha_emision, Long venta_id_venta, Long estado_ticket_id_estado, Long evento_id_evento, Long sector_id_sector) {
        this.id_ticket = id_ticket;
        this.cod_qr = cod_qr;
        this.num_asiento = num_asiento;
        this.nombre_titular = nombre_titular;
        this.run_titular = run_titular;
        this.fecha_emision = fecha_emision;
        this.venta_id_venta = venta_id_venta;
        setEstado_ticket_id_estado(estado_ticket_id_estado);
        this.evento_id_evento = evento_id_evento;
        this.sector_id_sector = sector_id_sector;
    }

    public Long getEstado_ticket_id_estado() {
        return estado == null ? null : estado.getId();
    }

    public void setEstado_ticket_id_estado(Long id) {
        this.estado = EstadoTicket.fromId(id);
    }
}
