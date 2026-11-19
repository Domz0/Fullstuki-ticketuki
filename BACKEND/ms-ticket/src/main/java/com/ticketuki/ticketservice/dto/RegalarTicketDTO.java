package com.ticketuki.ticketservice.dto;

import jakarta.validation.constraints.*;

public record RegalarTicketDTO(
        @NotNull @Positive Long destinatario,
        @NotBlank @Email @Size(max = 100) String correo) {}
