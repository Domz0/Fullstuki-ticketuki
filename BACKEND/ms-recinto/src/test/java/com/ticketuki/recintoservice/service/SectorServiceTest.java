package com.ticketuki.recintoservice.service;

import com.ticketuki.recintoservice.dto.SectorDTO;
import com.ticketuki.recintoservice.exception.RecintoNotFoundException;
import com.ticketuki.recintoservice.exception.SectorNotFoundException;
import com.ticketuki.recintoservice.repository.RecintoRepository;
import com.ticketuki.recintoservice.repository.SectorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SectorServiceTest {

    @Mock
    private SectorRepository sectorRepository;

    @Mock
    private RecintoRepository recintoRepository;

    @InjectMocks
    private SectorService sectorService;

    // ─────────────3: crear sector con recinto inexistente (error cruzado) ─────────────
    @Test
    void crearSector_recintoInexistente_lanzaRecintoNotFound() {
        SectorDTO dto = new SectorDTO(null, "Platea Baja", 1200, 35000, 7L);
        when(recintoRepository.findForUpdate(7L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sectorService.crearSector(dto))
                .isInstanceOf(RecintoNotFoundException.class)
                .hasMessage("Recinto no encontrado: 7");
    }

    // ────────────4 obtener sector inexistente (error) ─────────────
    @Test
    void obtenerSector_inexistente_lanzaSectorNotFound() {
        when(sectorRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sectorService.obtenerSector(99L))
                .isInstanceOf(SectorNotFoundException.class)
                .hasMessage("Sector no encontrado: 99");
    }
    @Test
    void actualizarSectorNoPermiteCambiarRecinto() {
        var sector = new com.ticketuki.recintoservice.model.Sector(1L, "Platea", 100, 5000, 7L);
        when(sectorRepository.findById(1L)).thenReturn(Optional.of(sector));
        assertThatThrownBy(() -> sectorService.actualizarSector(1L, new SectorDTO(1L, "Platea", 100, 5000, 8L)))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("recinto");
        org.mockito.Mockito.verify(sectorRepository, org.mockito.Mockito.never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test void sumaSectoresNoPuedeSuperarRecinto() {
        when(recintoRepository.findForUpdate(7L)).thenReturn(Optional.of(
            new com.ticketuki.recintoservice.model.Recinto(7L, "Recinto", 100, null)));
        when(sectorRepository.findForUpdateByRecinto(7L)).thenReturn(java.util.List.of(
            new com.ticketuki.recintoservice.model.Sector(1L, "Platea", 80, 5000, 7L)));
        assertThatThrownBy(() -> sectorService.crearSector(new SectorDTO(null, "Galeria", 30, 1000, 7L)))
            .isInstanceOf(IllegalArgumentException.class);
        org.mockito.Mockito.verify(sectorRepository, org.mockito.Mockito.never()).save(org.mockito.ArgumentMatchers.any());
    }

}
