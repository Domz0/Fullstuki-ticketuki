package com.ticketuki.ventaservice.promocion.repository;

import com.ticketuki.ventaservice.promocion.model.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PromocionRepository extends JpaRepository<Promocion, Long> {

    List<Promocion> findByEmpresaIgnoreCase(String empresa);

    @Query("SELECT p FROM Promocion p WHERE p.fecha_inicio <= :hoy AND p.fecha_expiracion >= :hoy")
    List<Promocion> findPromocionesActivas(@Param("hoy") LocalDate hoy);


    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_READ)
    @Query("SELECT p FROM Promocion p WHERE p.id_promocion = :id")
    java.util.Optional<Promocion> findForRead(@Param("id") Long id);
}
