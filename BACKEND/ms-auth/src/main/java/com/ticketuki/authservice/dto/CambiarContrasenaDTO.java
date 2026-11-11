package com.ticketuki.authservice.dto;

import jakarta.validation.constraints.*;

public record CambiarContrasenaDTO(@NotBlank String actual, @NotBlank @Size(min = 8, max = 100) String nueva) {
    @Override public String toString() { return "CambiarContrasenaDTO[protegido]"; }
}
