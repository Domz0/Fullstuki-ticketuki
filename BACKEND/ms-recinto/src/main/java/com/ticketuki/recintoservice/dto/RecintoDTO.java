package com.ticketuki.recintoservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecintoDTO {
    private Long id_recinto;

    @NotBlank(message = "El nombre del recinto no puede estar vacío")
    @jakarta.validation.constraints.Size(max = 50)
    private String nombre_recinto;

    @NotNull(message = "La capacidad total es obligatoria")
    @jakarta.validation.constraints.Positive
    private Integer capacidad_total;

    @Valid
    @NotNull(message = "La dirección del recinto es obligatoria")
    private DireccionRecintoDTO direccion;
}
