package com.ticketuki.recintoservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SectorDTO {
    private Long id_sector;

    @NotBlank(message = "El nombre del sector no puede estar vacío")
    @jakarta.validation.constraints.Size(max = 25)
    private String nombre_sector;

    @NotNull(message = "La capacidad del sector es obligatoria")
    @jakarta.validation.constraints.Positive
    private Integer capacidad_sector;

    @NotNull(message = "El precio del sector es obligatorio")
    @jakarta.validation.constraints.PositiveOrZero
    private Integer precio_sector;

    @NotNull(message = "El ID del recinto es obligatorio")
    @jakarta.validation.constraints.Positive
    private Long recinto_id_recinto;
}
