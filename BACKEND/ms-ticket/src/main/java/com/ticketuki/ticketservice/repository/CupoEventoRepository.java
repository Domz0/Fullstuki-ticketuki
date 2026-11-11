package com.ticketuki.ticketservice.repository;

import com.ticketuki.ticketservice.model.CupoEvento;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface CupoEventoRepository extends JpaRepository<CupoEvento, Long> {
    @Modifying
    @Query(value = "INSERT IGNORE INTO cupo_evento(evento_id) VALUES (:id)", nativeQuery = true)
    void asegurar(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM CupoEvento c WHERE c.eventoId = :id")
    Optional<CupoEvento> bloquear(@Param("id") Long id);
}
