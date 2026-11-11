package com.ticketuki.recintoservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DireccionRecintoDTO {
    private Long id_direccion_recinto;

    @NotBlank(message = "La calle es obligatoria")
    @jakarta.validation.constraints.Size(max = 50)
    private String calle;

    @NotBlank(message = "La región es obligatoria")
    @jakarta.validation.constraints.Size(max = 50)
    private String region;

    @NotBlank(message = "La comuna es obligatoria")
    @jakarta.validation.constraints.Size(max = 50)
    private String comuna;

    @NotNull(message = "El número de calle es obligatorio")
    @jakarta.validation.constraints.Positive
    private Integer num_calle;

    @jakarta.validation.constraints.Size(max = 100)
    private String referencia_acceso;
}
