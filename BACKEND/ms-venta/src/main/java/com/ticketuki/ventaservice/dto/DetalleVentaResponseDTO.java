package com.ticketuki.ventaservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleVentaResponseDTO {

    private Long id_detalle;
    private Integer cantidad_ticket;
    private Long precio_neto;
    private Long precio_iva;
    private Long precio_total;
    private Long comision;
    private Long usuario_id_usuario;
    private Long venta_id_venta;
    private Long sector_id_sector;
    private Long promocion_id;
    private Long descuento_monto;

    private Long evento_id_evento;
}
