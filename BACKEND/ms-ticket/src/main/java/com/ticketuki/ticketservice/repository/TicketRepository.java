package com.ticketuki.ticketservice.repository;

import com.ticketuki.ticketservice.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Ticket t WHERE t.id_ticket = :id")
    Optional<Ticket> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Ticket t WHERE t.cod_qr = :qr")
    Optional<Ticket> findByQrForUpdate(@Param("qr") String qr);

    @Query("SELECT t FROM Ticket t WHERE t.cod_qr = :cod_qr")
    Optional<Ticket> findByCod_qr(@Param("cod_qr") String cod_qr);

    @Query("SELECT t FROM Ticket t WHERE t.venta_id_venta = :venta_id_venta")
    List<Ticket> findByVenta_id_venta(@Param("venta_id_venta") Long venta_id_venta);

    @Query("SELECT t FROM Ticket t WHERE t.evento_id_evento = :evento_id_evento")
    List<Ticket> findByEvento_id_evento(@Param("evento_id_evento") Long evento_id_evento);

    @Query("SELECT t FROM Ticket t WHERE t.sector_id_sector = :sector_id_sector")
    List<Ticket> findBySector_id_sector(@Param("sector_id_sector") Long sector_id_sector);

    @Query("SELECT t FROM Ticket t WHERE t.run_titular = :run_titular")
    List<Ticket> findByRun_titular(@Param("run_titular") String run_titular);

    @Query("SELECT COUNT(t) > 0 FROM Ticket t WHERE t.num_asiento = :num_asiento AND t.evento_id_evento = :evento_id_evento AND t.sector_id_sector = :sector_id_sector")
    boolean existsByNum_asientoAndEvento_id_eventoAndSector_id_sector(
            @Param("num_asiento") Integer num_asiento,
            @Param("evento_id_evento") Long evento_id_evento,
            @Param("sector_id_sector") Long sector_id_sector);
}
