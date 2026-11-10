package com.ticketuki.usuarioservice.repository;

import com.ticketuki.usuarioservice.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByRun(String run);
    Optional<Usuario> findByEmailIgnoreCase(String email);
}
