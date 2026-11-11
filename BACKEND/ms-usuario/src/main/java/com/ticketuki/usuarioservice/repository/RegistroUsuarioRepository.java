package com.ticketuki.usuarioservice.repository;

import com.ticketuki.usuarioservice.model.RegistroUsuario;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface RegistroUsuarioRepository extends JpaRepository<RegistroUsuario, String> {
    @Modifying
    @Query(value = "INSERT IGNORE INTO registro_usuario (id) VALUES (:id)", nativeQuery = true)
    void asegurarRegistro(@Param("id") String id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM RegistroUsuario r WHERE r.id = :id")
    Optional<RegistroUsuario> bloquear(@Param("id") String id);
}
