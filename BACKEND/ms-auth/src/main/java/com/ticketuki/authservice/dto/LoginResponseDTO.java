package com.ticketuki.authservice.dto;

import com.ticketuki.authservice.model.Rol;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {

    private String token;
    private String tipo;        // "Bearer"
    private String username;
    private long expiraEnMs;
    private Long authId;
    private Long usuarioId;
    private Rol rol;
}
