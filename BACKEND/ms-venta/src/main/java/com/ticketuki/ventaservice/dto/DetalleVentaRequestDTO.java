package com.ticketuki.ventaservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleVentaRequestDTO {

    @NotNull(message = "La cantidad de tickets es requerida")
    @Positive(message = "La cantidad de tickets debe ser mayor a 0")
    private Integer cantidad_ticket;

    private Long precio_neto;

    @NotNull(message = "El usuario es requerido")
    private Long usuario_id_usuario;

    @NotNull(message = "El sector es requerido")
    private Long sector_id_sector;

    private Long promocion_id;

    @NotNull @Positive
    private Long evento_id_evento;
}
