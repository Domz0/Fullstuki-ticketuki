package com.ticketuki.ventaservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VentaRequestDTO {

    @NotBlank(message = "El medio de pago es requerido")
    private String medio_pago;

    @NotBlank(message = "El código de autorización es requerido")
    @Size(max = 50)
    private String cod_autorizacion;

    private Long estado_venta_id_estado;

    @Valid
    @NotEmpty(message = "La venta debe tener al menos un detalle")
    private List<@NotNull DetalleVentaRequestDTO> detalles;
}
