package com.ticketuki.authservice.repository;

import com.ticketuki.authservice.model.UsuarioAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioAuthRepository extends JpaRepository<UsuarioAuth, Long> {

    Optional<UsuarioAuth> findByUsername(String username);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT u FROM UsuarioAuth u WHERE u.username = :username")
    Optional<UsuarioAuth> findForUpdateByUsername(@org.springframework.data.repository.query.Param("username") String username);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT u FROM UsuarioAuth u WHERE u.id_usuario_auth = :id")
    Optional<UsuarioAuth> findForUpdate(@org.springframework.data.repository.query.Param("id") Long id);
}
