package com.ticketuki.ticketservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponseDTO {

    private Long id_ticket;
    private String cod_qr;
    private String nombre_titular;
    private String run_titular;
    private LocalDate fecha_emision;
    private Long venta_id_venta;
    private Long estado_ticket_id_estado;
    private Long evento_id_evento;
    private Long sector_id_sector;
}
