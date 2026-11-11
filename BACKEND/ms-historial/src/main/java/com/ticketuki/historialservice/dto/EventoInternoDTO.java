package com.ticketuki.historialservice.dto;

import com.ticketuki.historialservice.model.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record EventoInternoDTO(
    @NotBlank @Pattern(regexp="[0-9a-fA-F-]{36}") String eventoId,
    @NotBlank @Size(max=50) String origen,
    @NotNull TipoEntidad entidad,
    @NotNull @Positive Long idEntidad,
    @NotNull AccionHistorial accion,
    Long usuarioId,
    Long authId,
    @NotNull LocalDateTime fecha,
    @NotBlank @Size(max=100) String operacion) {}
