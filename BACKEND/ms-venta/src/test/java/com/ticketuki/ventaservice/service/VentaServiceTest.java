package com.ticketuki.ventaservice.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ticketuki.ventaservice.promocion.repository.PromocionRepository;
import com.ticketuki.ventaservice.dto.DetalleVentaRequestDTO;
import com.ticketuki.ventaservice.dto.EstadoVentaDTO;
import com.ticketuki.ventaservice.dto.VentaRequestDTO;
import com.ticketuki.ventaservice.dto.VentaResponseDTO;
import com.ticketuki.ventaservice.exception.VentaNotFoundException;
import com.ticketuki.ventaservice.model.Venta;
import com.ticketuki.ventaservice.repository.DetalleVentaRepository;
import com.ticketuki.ventaservice.repository.VentaRepository;

@ExtendWith(MockitoExtension.class)
class VentaServiceTest {

    @Mock
    private VentaRepository ventaRepository;

    @Mock
    private DetalleVentaRepository detalleVentaRepository;

    @Mock
    private PromocionRepository promocionRepository;

    @InjectMocks
    private VentaService ventaService;

    // ──────1 crear venta sin promocion - formula monto_total ───────
    @Test
    void crearVenta_sinPromocion_calculaMontoTotalConIvaYComision() {
        // 1 detalle 2 tickets a 10.000 cada unoo, sin promocion
        DetalleVentaRequestDTO det = new DetalleVentaRequestDTO(2, 10000L, 1L, 1L, null);
        VentaRequestDTO req = new VentaRequestDTO("TARJETA", "AUTH-1", 1L, List.of(det));

        when(ventaRepository.save(any(Venta.class))).thenAnswer(inv -> {
            Venta v = inv.getArgument(0);
            v.setId_venta(2L);
            return v;
        });
        when(detalleVentaRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        VentaResponseDTO res = ventaService.crearVenta(req);

        // precio base=10000, iva19=1900, comision(10)=1000 --- (12900)*2 = 25800
        assertThat(res.getMonto_total()).isEqualTo(25800L);
        assertThat(res.getEstado_venta().getNombre()).isEqualTo("PENDIENTE");
        assertThat(res.getDetalles()).hasSize(1);
    }

    // ───────2 cambiar estado exitoso ───────
    @Test
    void cambiarEstado_ventaExistente_actualizaEstado() {
        Venta venta = new Venta(5L, LocalDateTime.now(), "TARJETA", "AUTH", 25800L, 1L, null, null);
        when(ventaRepository.findById(5L)).thenReturn(Optional.of(venta));
        when(ventaRepository.save(any(Venta.class))).thenReturn(venta);

        VentaResponseDTO res = ventaService.cambiarEstado(5L, 2L);

        assertThat(res.getEstado_venta().getNombre()).isEqualTo("CONFIRMADA");
    }

    // ────── la entidad guardada se construye bien ───────
    @Test
    void crearVenta_guardaVentaConMontoYEstadoCorrectos() {
        DetalleVentaRequestDTO det = new DetalleVentaRequestDTO(2, 10000L, 1L, 1L, null);
        VentaRequestDTO req = new VentaRequestDTO("TARJETA", "AUTH-1", 1L, List.of(det));

        // save devuelve un objeto distinto - el argumento tiene su estado original
        when(ventaRepository.save(any(Venta.class)))
                .thenReturn(new Venta(2L, LocalDateTime.now(), "TARJETA", "AUTH-1", 25800L, 1L, null, null));
        when(detalleVentaRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        ventaService.crearVenta(req);

    
        ArgumentCaptor<Venta> captor = ArgumentCaptor.forClass(Venta.class);
        verify(ventaRepository).save(captor.capture());
        Venta enviada = captor.getValue();

        assertThat(enviada.getId_venta()).isNull();   // sin id (se lo pasa la BD)
        assertThat(enviada.getMonto_total()).isEqualTo(25800L);  // el calculo quedo en la entidad
        assertThat(enviada.getEstado_venta_id_estado()).isEqualTo(1L);
        assertThat(enviada.getMedio_pago()).isEqualTo("TARJETA");
    }

    // ───────3 obtener venta inexistente (error) ───────
    @Test
    void obtenerVenta_inexistente_lanzaNotFound() {
        when(ventaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ventaService.obtenerVenta(99L))
                .isInstanceOf(VentaNotFoundException.class)
                .hasMessage("Venta no encontrada: 99");
    }

    // ─────── 4obtener detalle inexistente (error) ───────
    @Test
    void obtenerDetalle_inexistente_lanzaNotFound() {
        when(detalleVentaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ventaService.obtenerDetalle(99L))
                .isInstanceOf(VentaNotFoundException.class)
                .hasMessage("Detalle de venta no encontrado: 99");
    }

    private com.ticketuki.ventaservice.promocion.model.Promocion promocion(java.time.LocalDate inicio, java.time.LocalDate fin) {
        return com.ticketuki.ventaservice.promocion.model.Promocion.builder()
                .id_promocion(7L).descuento(20).fecha_inicio(inicio).fecha_expiracion(fin).build();
    }

    @Test
    void descuentoLocalSeAplicaAntesDeIvaYComision() {
        var hoy = java.time.LocalDate.now();
        when(promocionRepository.findForRead(7L)).thenReturn(Optional.of(promocion(hoy, hoy)));
        when(ventaRepository.save(any(Venta.class))).thenAnswer(i -> i.getArgument(0));
        when(detalleVentaRepository.saveAll(any())).thenAnswer(i -> i.getArgument(0));
        var request = new VentaRequestDTO("CREDITO", "AUTH", 1L,
                List.of(new DetalleVentaRequestDTO(2, 10000L, 1L, 1L, 7L)));
        var response = ventaService.crearVenta(request);
        assertThat(response.getMonto_total()).isEqualTo(20640L);
        assertThat(response.getDetalles().getFirst().getDescuento_monto()).isEqualTo(2000L);
        assertThat(response.getDetalles().getFirst().getPromocion_id()).isEqualTo(7L);
    }

    @Test
    void promocionVencidaNoGuardaVenta() {
        var hoy = java.time.LocalDate.now();
        when(promocionRepository.findForRead(7L)).thenReturn(Optional.of(promocion(hoy.minusDays(2), hoy.minusDays(1))));
        var request = new VentaRequestDTO("CREDITO", "AUTH", 1L,
                List.of(new DetalleVentaRequestDTO(1, 10000L, 1L, 1L, 7L)));
        assertThatThrownBy(() -> ventaService.crearVenta(request)).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("vigente");
        org.mockito.Mockito.verify(ventaRepository, org.mockito.Mockito.never()).save(any());
    }

    @Test
    void promocionInexistenteNoSeIgnora() {
        when(promocionRepository.findForRead(7L)).thenReturn(Optional.empty());
        var request = new VentaRequestDTO("CREDITO", "AUTH", 1L,
                List.of(new DetalleVentaRequestDTO(1, 10000L, 1L, 1L, 7L)));
        assertThatThrownBy(() -> ventaService.crearVenta(request)).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("no encontrada");
        org.mockito.Mockito.verify(ventaRepository, org.mockito.Mockito.never()).save(any());
    }

    @Test
    void estadoDesconocidoNoGuardaVenta() {
        var request = new VentaRequestDTO("CREDITO", "AUTH", 99L,
                List.of(new DetalleVentaRequestDTO(1, 10000L, 1L, 1L, null)));
        assertThatThrownBy(() -> ventaService.crearVenta(request)).isInstanceOf(IllegalArgumentException.class);
        org.mockito.Mockito.verify(ventaRepository, org.mockito.Mockito.never()).save(any());
    }
}
