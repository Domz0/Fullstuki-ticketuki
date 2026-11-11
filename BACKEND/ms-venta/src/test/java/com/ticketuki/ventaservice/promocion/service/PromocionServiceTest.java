package com.ticketuki.ventaservice.promocion.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ticketuki.ventaservice.promocion.dto.PromocionRequestDTO;
import com.ticketuki.ventaservice.promocion.dto.PromocionResponseDTO;
import com.ticketuki.ventaservice.promocion.exception.PromocionNotFoundException;
import com.ticketuki.ventaservice.promocion.model.Promocion;
import com.ticketuki.ventaservice.promocion.repository.PromocionRepository;

@ExtendWith(MockitoExtension.class)
class PromocionServiceTest {

    @Mock
    private PromocionRepository promocionRepository;

    @InjectMocks
    private PromocionService promocionService;

    private Promocion promoEjemplo() {
        return Promocion.builder()
                .id_promocion(1L)
                .empresa("Falabella")
                .descuento(20)
                .descripcion("Descuento de verano")
                .restriccion("Solo fines de semana")
                .fecha_inicio(LocalDate.of(2026, 1, 1))
                .fecha_expiracion(LocalDate.of(2026, 12, 31))
                .build();
    }

    // ─────────────1: crear exitoso ─────────────
    @Test
    void crearPromocion_conFechasValidas_devuelveDTO() {
        PromocionRequestDTO req = new PromocionRequestDTO("Falabella", 20,
                "Descuento de verano", "Solo fines de semana",
                LocalDate.of(2026, 12, 31), LocalDate.of(2026, 1, 1));
        when(promocionRepository.save(any(Promocion.class))).thenReturn(promoEjemplo());

        PromocionResponseDTO res = promocionService.crearPromocion(req);

        assertThat(res.getId_promocion()).isEqualTo(1L);
        assertThat(res.getEmpresa()).isEqualTo("Falabella");
        assertThat(res.getDescuento()).isEqualTo(20);
    }

    // ────────────2: fechas invalidas (validacion de negocio────────────
    @Test
    void crearPromocion_inicioPosteriorAExpiracion_lanzaIllegalArgument() {
        PromocionRequestDTO req = new PromocionRequestDTO("Falabella", 20,
                "desc", "restr",
                LocalDate.of(2026, 1, 1),     
                LocalDate.of(2026, 6, 1));    

        assertThatThrownBy(() -> promocionService.crearPromocion(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("La fecha de inicio no puede ser posterior a la fecha de expiración");
    }

    // ────────────3: obtener inexistente (error) ─────────────
    @Test
    void obtenerPromocion_inexistente_lanzaNotFound() {
        when(promocionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> promocionService.obtenerPromocion(99L))
                .isInstanceOf(PromocionNotFoundException.class)
                .hasMessage("Promoción no encontrada: 99");
    }

    // ───────────4: listar activas (filtrado) ─────────────
    @Test
    void listarActivas_devuelveLasVigentes() {
        when(promocionRepository.findPromocionesActivas(any(LocalDate.class)))
                .thenReturn(List.of(promoEjemplo()));

        List<PromocionResponseDTO> res = promocionService.listarActivas();

        assertThat(res).hasSize(1);
        assertThat(res.get(0).getEmpresa()).isEqualTo("Falabella");
    }
}
