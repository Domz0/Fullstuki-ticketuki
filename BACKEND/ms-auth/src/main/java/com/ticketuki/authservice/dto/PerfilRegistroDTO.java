package com.ticketuki.authservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Locale;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerfilRegistroDTO {

    @NotBlank(message = "RUN no puede estar vacío")
    @Pattern(regexp = "^[0-9]{1,2}\\.[0-9]{3}\\.[0-9]{3}-[0-9kK]$",
            message = "Formato RUN inválido")
    private String run;

    @NotBlank(message = "Primer nombre es obligatorio")
    @Size(min = 2, max = 25, message = "Primer nombre debe tener entre 2 y 25 caracteres")
    private String p_nombre;

    @Size(max = 25, message = "Segundo nombre no puede exceder 25 caracteres")
    private String s_nombre;

    @NotBlank(message = "Apellido materno es obligatorio")
    @Size(max = 25, message = "Apellido materno no puede exceder 25 caracteres")
    private String a_materno;

    @NotBlank(message = "Apellido paterno es obligatorio")
    @Size(min = 2, max = 25, message = "Apellido paterno debe tener entre 2 y 25 caracteres")
    private String a_paterno;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email debe ser válido")
    @Size(max = 100, message = "El email no puede exceder 100 caracteres")
    private String email;

    @Valid
    @NotNull(message = "Dirección es obligatoria")
    private DireccionRegistroDTO direccion;

    public void setRun(String run) {
        if (run == null) {
            this.run = null;
            return;
        }
        String valor = run.trim().toUpperCase(Locale.ROOT);
        if (valor.matches("[0-9]{7,8}-[0-9K]")) {
            valor = valor.replaceFirst("^([0-9]{1,2})([0-9]{3})([0-9]{3})(-[0-9K])$", "$1.$2.$3$4");
        }
        this.run = valor;
    }

    public void setEmail(String email) {
        this.email = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
