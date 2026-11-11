package com.ticketuki.ventaservice.pago.dto;

import com.ticketuki.ventaservice.pago.model.MedioPago;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagoRequestDTO {

    @NotNull(message = "El monto es requerido")
    @Positive(message = "El monto debe ser mayor a 0")
    private Long monto;

    @NotNull(message = "El medio de pago es requerido")
    private MedioPago medio_pago;

    @NotBlank(message = "El código de autorización es requerido")
    @jakarta.validation.constraints.Size(max = 50)
    private String cod_autorizacion;

    @NotNull(message = "El ID de venta es requerido")
    @Positive
    private Long venta_id;

    @NotNull(message = "El ID de usuario es requerido")
    @Positive
    private Long usuario_id;
}
