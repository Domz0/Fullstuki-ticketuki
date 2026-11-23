package com.ticketuki.authservice.repository;

import com.ticketuki.authservice.model.UsuarioAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioAuthRepository extends JpaRepository<UsuarioAuth, Long> {

    Optional<UsuarioAuth> findByUsername(String username);
    Optional<UsuarioAuth> findByUsuarioId(Long usuarioId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT u FROM UsuarioAuth u WHERE u.username = :username")
    Optional<UsuarioAuth> findForUpdateByUsername(@org.springframework.data.repository.query.Param("username") String username);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT u FROM UsuarioAuth u WHERE u.id_usuario_auth = :id")
    Optional<UsuarioAuth> findForUpdate(@org.springframework.data.repository.query.Param("id") Long id);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select u from UsuarioAuth u where u.rol = com.ticketuki.authservice.model.Rol.ADMIN order by u.id_usuario_auth")
    java.util.List<com.ticketuki.authservice.model.UsuarioAuth> bloquearAdministradores();

    @org.springframework.data.jpa.repository.Query(
        value = "select u from UsuarioAuth u order by u.id_usuario_auth",
        countQuery = "select count(u) from UsuarioAuth u")
    org.springframework.data.domain.Page<UsuarioAuth> listarCuentas(org.springframework.data.domain.Pageable pagina);
}
