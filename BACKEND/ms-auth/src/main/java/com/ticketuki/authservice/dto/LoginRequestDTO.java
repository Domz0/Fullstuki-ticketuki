package com.ticketuki.authservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDTO {

    @NotBlank(message = "El username es requerido")
    private String username;

    @NotBlank(message = "El password es requerido")
    @ToString.Exclude
    private String password;
}
