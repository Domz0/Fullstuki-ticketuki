package com.ticketuki.authservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
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

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "token_version", nullable = false)
    private long tokenVersion;

    @Column(name = "registro_rechazado", nullable = false)
    private boolean registroRechazado;

    @Column(name = "registro_id", unique = true, length = 36)
    private String registroId;

    @JsonIgnore @ToString.Exclude
    @Column(name = "registro_fingerprint", length = 64)
    private String registroFingerprint;

    public UsuarioAuth(Long id, String username, String password, Rol rol, Long usuarioId) {
        this.id_usuario_auth = id;
        this.username = username;
        this.password = password;
        this.rol = rol;
        this.usuarioId = usuarioId;
    }
}
