package com.ticketuki.usuarioservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "registro_usuario")
@Getter @Setter @NoArgsConstructor
public class RegistroUsuario {
    @Id @Column(length = 36)
    private String id;

    @Column(name = "usuario_id", unique = true)
    private Long usuarioId;
}
