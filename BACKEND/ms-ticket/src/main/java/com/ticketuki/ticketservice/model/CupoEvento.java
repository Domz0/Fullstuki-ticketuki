package com.ticketuki.ticketservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "cupo_evento")
@Getter @Setter @NoArgsConstructor
public class CupoEvento {
    @Id @Column(name = "evento_id")
    private Long eventoId;
}
