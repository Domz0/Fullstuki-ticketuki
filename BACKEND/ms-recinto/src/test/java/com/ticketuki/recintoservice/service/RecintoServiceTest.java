package com.ticketuki.recintoservice.service;

import com.ticketuki.recintoservice.dto.DireccionRecintoDTO;
import com.ticketuki.recintoservice.dto.RecintoDTO;
import com.ticketuki.recintoservice.exception.RecintoNotFoundException;
import com.ticketuki.recintoservice.model.DireccionRecinto;
import com.ticketuki.recintoservice.model.Recinto;
import com.ticketuki.recintoservice.repository.RecintoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecintoServiceTest {

    @Mock
    private RecintoRepository recintoRepository;

    @InjectMocks
    private RecintoService recintoService;

    // ─────────────1: crear recinto exitoso ─────────────
    @Test
    void crearRecinto_conDatosValidos_devuelveDTO() {
        DireccionRecintoDTO dirDto = new DireccionRecintoDTO(null, "Av. Grecia", "RM", "Ñuñoa", 2001, "Puerta 4");
        RecintoDTO req = new RecintoDTO(null, "Estadio Nacional", 48000, dirDto);

        DireccionRecinto dirGuardada = new DireccionRecinto(7L, "Av. Grecia", "RM", "Ñuñoa", 2001, "Puerta 4");
        Recinto guardado = new Recinto(1L, "Estadio Nacional", 48000, dirGuardada);
        when(recintoRepository.save(any(Recinto.class))).thenReturn(guardado);

        RecintoDTO res = recintoService.crearRecinto(req);

        assertThat(res.getId_recinto()).isEqualTo(1L);
        assertThat(res.getNombre_recinto()).isEqualTo("Estadio Nacional");
        assertThat(res.getCapacidad_total()).isEqualTo(48000);
        assertThat(res.getDireccion().getComuna()).isEqualTo("Ñuñoa");
    }

    // ───────────── 2: obtener recinto inexistente (error) ─────────────
    @Test
    void obtenerRecinto_inexistente_lanzaNotFound() {
        when(recintoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> recintoService.obtenerRecinto(99L))
                .isInstanceOf(RecintoNotFoundException.class)
                .hasMessage("Recinto no encontrado: 99");
    }
    @Test
    void actualizarRecintoCreaDireccionFaltante() {
        Recinto recinto = new Recinto(1L, "Recinto", 100, null);
        when(recintoRepository.findForUpdate(1L)).thenReturn(Optional.of(recinto));
        when(recintoRepository.save(any(Recinto.class))).thenAnswer(i -> i.getArgument(0));
        DireccionRecintoDTO direccion = new DireccionRecintoDTO(null, "Calle", "RM", "Santiago", 10, null);
        var respuesta = recintoService.actualizarRecinto(1L, new RecintoDTO(1L, "Nuevo", 100, direccion));
        assertThat(respuesta.getDireccion().getCalle()).isEqualTo("Calle");
    }
}
