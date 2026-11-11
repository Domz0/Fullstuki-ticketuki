package com.ticketuki.ventaservice.pago.repository;

import com.ticketuki.ventaservice.pago.model.EstadoPago;
import com.ticketuki.ventaservice.pago.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    @Query("SELECT p FROM Pago p WHERE p.venta_id = :ventaId")
    List<Pago> findByVenta_id(@Param("ventaId") Long ventaId);

    @Query("SELECT p FROM Pago p WHERE p.usuario_id = :usuarioId")
    List<Pago> findByUsuario_id(@Param("usuarioId") Long usuarioId);

    List<Pago> findByEstado(EstadoPago estado);

    List<Pago> findByTimestampBetween(LocalDateTime inicio, LocalDateTime fin);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Pago p WHERE p.id_pago = :id")
    java.util.Optional<Pago> findForUpdate(@Param("id") Long id);
}
