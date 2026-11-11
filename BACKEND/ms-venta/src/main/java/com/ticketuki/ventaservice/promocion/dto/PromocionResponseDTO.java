package com.ticketuki.ventaservice.promocion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromocionResponseDTO {

    private Long id_promocion;
    private String empresa;
    private Integer descuento;
    private String descripcion;
    private String restriccion;
    private LocalDate fecha_expiracion;
    private LocalDate fecha_inicio;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
}
