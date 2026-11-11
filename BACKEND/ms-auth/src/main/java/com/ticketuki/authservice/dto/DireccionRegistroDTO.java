package com.ticketuki.authservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DireccionRegistroDTO {

    @NotBlank(message = "La calle es obligatoria")
    @Size(max = 50, message = "La calle no puede exceder 50 caracteres")
    private String calle;

    @NotBlank(message = "La región es obligatoria")
    @Size(max = 50, message = "La región no puede exceder 50 caracteres")
    private String region;

    @NotBlank(message = "La comuna es obligatoria")
    @Size(max = 50, message = "La comuna no puede exceder 50 caracteres")
    private String comuna;

    @NotNull(message = "El número de calle es obligatorio")
    @Positive(message = "El número de calle debe ser positivo")
    private Integer num_calle;
}
