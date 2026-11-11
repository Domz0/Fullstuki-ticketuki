package com.ticketuki.eventoservice.repository;

import com.ticketuki.eventoservice.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {

    @Query("SELECT e FROM Evento e WHERE e.fecha_evento = :fechaEvento")
    List<Evento> findByFechaEvento(@Param("fechaEvento") LocalDate fechaEvento);

    @Query("SELECT e FROM Evento e WHERE e.recinto_id_recinto = :recintoId")
    List<Evento> findByRecintoIdRecinto(@Param("recintoId") Long recintoId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Evento e WHERE e.id_evento = :id")
    java.util.Optional<Evento> findForUpdate(@org.springframework.data.repository.query.Param("id") Long id);
}
