package com.ticketuki.usuarioservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponseDTO {
    private Long id_usuario;
    private String run;
    private String p_nombre;
    private String s_nombre;
    private String a_materno;
    private String a_paterno;
    private String email;
}
