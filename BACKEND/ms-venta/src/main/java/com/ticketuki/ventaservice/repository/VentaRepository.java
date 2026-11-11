package com.ticketuki.ventaservice.repository;

import com.ticketuki.ventaservice.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

    @Query("SELECT v FROM Venta v WHERE v.fecha_venta BETWEEN :inicio AND :fin")
    List<Venta> findByFecha_ventaBetween(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM Venta v WHERE v.id_venta = :id")
    java.util.Optional<Venta> findForUpdate(@Param("id") Long id);
}
