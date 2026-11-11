package com.ticketuki.ventaservice.pago.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TicketResumenDTO {
    private Long id_ticket;
    private Long estado_ticket_id_estado;
}
