package com.ticketuki.usuarioservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuario")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id_usuario;

    @NotBlank(message = "El RUN es requerido")
    @Column(nullable = false, unique = true, length = 12)
    private String run;

    @NotBlank(message = "El primer nombre es requerido")
    @Column(name = "p_nombre", nullable = false, length = 25)
    private String p_nombre;

    @Column(name = "s_nombre", length = 25)
    private String s_nombre;

    @NotBlank(message = "El apellido materno es requerido")
    @Column(name = "a_materno", nullable = false, length = 25)
    private String a_materno;

    @NotBlank(message = "El apellido paterno es requerido")
    @Column(name = "a_paterno", nullable = false, length = 25)
    private String a_paterno;

    @NotBlank(message = "El email es requerido")
    @Email(message = "El email debe ser válido")
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "direccion_usuario_id_direccion", referencedColumnName = "id_direccion_usuario")
    private DireccionUsuario direccion;
}
