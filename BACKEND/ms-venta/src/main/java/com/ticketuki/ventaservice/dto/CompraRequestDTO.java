package com.ticketuki.ventaservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record CompraRequestDTO(
        @NotBlank @Size(max=80) @Pattern(regexp="[A-Za-z0-9_-]+") String clave,
        @NotNull @Valid VentaRequestDTO venta,
        @NotEmpty @Size(max=100) List<@NotNull @Valid Titular> titulares) {
    public record Titular(@NotNull @Positive Long evento_id_evento,
            @NotNull @Positive Long sector_id_sector, @NotNull @Positive Integer num_asiento,
            @NotBlank @Size(max=50) String nombre_titular,
            @NotBlank @Pattern(regexp="\\d{1,2}\\.\\d{3}\\.\\d{3}-[\\dKk]") String run_titular) {}
}
