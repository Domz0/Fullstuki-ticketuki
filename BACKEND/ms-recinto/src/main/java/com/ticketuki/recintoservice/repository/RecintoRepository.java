package com.ticketuki.recintoservice.repository;

import com.ticketuki.recintoservice.model.Recinto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecintoRepository extends JpaRepository<Recinto, Long> {

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT r FROM Recinto r WHERE r.id_recinto = :id")
    java.util.Optional<Recinto> findForUpdate(@org.springframework.data.repository.query.Param("id") Long id);
}
