package com.ticketuki.authservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.ToString;

@Data
public class RegistroRequestDTO {
    @NotBlank @Size(min = 3, max = 50)
    @Pattern(regexp = "[a-zA-Z0-9._-]+")
    private String username;

    @NotBlank @Size(min = 8, max = 100)
    @ToString.Exclude
    private String password;

    @Valid @NotNull
    private PerfilRegistroDTO usuario;

    public void setUsername(String username) {
        this.username = username == null ? null : username.trim().toLowerCase(java.util.Locale.ROOT);
    }
}
