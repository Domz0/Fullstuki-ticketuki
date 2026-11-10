package com.ticketuki.authservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuario_auth")
public class UsuarioAuth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario_auth")
    private Long id_usuario_auth;

    @NotBlank(message = "El username es requerido")
    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @NotBlank(message = "El password es requerido")
    @JsonIgnore
    @ToString.Exclude
    @Column(name = "password", nullable = false, length = 100)
    private String password;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "rol", nullable = false, length = 20)
    private Rol rol = Rol.CLIENTE;

    @Positive
    @Column(name = "usuario_id", unique = true)
    private Long usuarioId;
}
