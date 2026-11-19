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

    @Query(value = """
            SELECT v.* FROM venta v WHERE
            EXISTS (SELECT 1 FROM detalle_venta d WHERE d.venta_id_venta=v.id_venta AND d.usuario_id_usuario=:usuario)
            OR EXISTS (SELECT 1 FROM compra c WHERE c.venta_id=v.id_venta AND c.usuario_id IS NULL
                AND REPLACE(REPLACE(UPPER(c.rut_comprador), '.', ''), '-', '')=:rut)
            ORDER BY v.fecha_venta DESC, v.id_venta DESC
            """, nativeQuery = true)
    List<Venta> buscarHistorial(@Param("usuario") Long usuario, @Param("rut") String rut);

    @Query("SELECT v FROM Venta v WHERE v.fecha_venta BETWEEN :inicio AND :fin")
    List<Venta> findByFecha_ventaBetween(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM Venta v WHERE v.id_venta = :id")
    java.util.Optional<Venta> findForUpdate(@Param("id") Long id);
}
