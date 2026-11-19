package com.ticketuki.ventaservice.dto;

import jakarta.validation.constraints.*;
import com.ticketuki.ventaservice.pago.model.MedioPago;

public record CompraPublicaDTO(
        @NotBlank @Pattern(regexp="[A-Za-z0-9_-]{16,80}") String clave,
        @NotNull @Positive Long evento,
        @NotNull @Positive Long sector,
        @NotNull @Min(1) @Max(6) Integer cantidad,
        @NotBlank @Size(max=50) String nombre,
        @NotBlank @Pattern(regexp="\\d{1,2}\\.\\d{3}\\.\\d{3}-[\\dKk]") String rut,
        @NotBlank @Email @Size(max=254)
        @Pattern(regexp="(?i)^[^\\s@]+@(duoc\\.cl|gmail\\.com|duocuc\\.cl|profesor\\.duoc\\.cl)$",
                message="Usa un correo de duoc.cl, gmail.com, duocuc.cl o profesor.duoc.cl") String correo,
        @NotNull MedioPago medio,
        @Size(max=30) @Pattern(regexp="[A-Za-z0-9_-]*") String codigo) {}
