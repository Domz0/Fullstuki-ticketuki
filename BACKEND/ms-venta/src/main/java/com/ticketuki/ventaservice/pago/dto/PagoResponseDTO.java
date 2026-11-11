package com.ticketuki.ventaservice.pago.dto;

import com.ticketuki.ventaservice.pago.model.EstadoPago;
import com.ticketuki.ventaservice.pago.model.MedioPago;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagoResponseDTO {

    private Long id_pago;
    private Long monto;
    private MedioPago medio_pago;
    private String cod_autorizacion;
    private LocalDateTime timestamp;
    private EstadoPago estado;
    private Long venta_id;
    private Long usuario_id;
}
