package com.ticketuki.ventaservice.promocion;

import com.ticketuki.common.security.AccesoServicio;
import com.ticketuki.common.validation.ValidacionDatos;
import com.ticketuki.ventaservice.promocion.dto.PromocionRequestDTO;
import com.ticketuki.ventaservice.promocion.repository.PromocionRepository;
import com.ticketuki.ventaservice.promocion.service.PromocionService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;


class PromocionServiceTest {
    private final AccesoServicio acceso = mock(AccesoServicio.class);
    private final PromocionRepository repositorio = mock(PromocionRepository.class);
    private final PromocionService service = new PromocionService(mock(ValidacionDatos.class), acceso, repositorio);

    @Test void noCreaUnaPromocionQueEmpiezaDespuesDeVencer() {
        var dto = new PromocionRequestDTO();
        dto.setEmpresa("Duoc");
        dto.setDescuento(10);
        dto.setRestriccion("SIN_RESTRICCION");
        dto.setFecha_inicio(LocalDate.of(2099, 12, 31));
        dto.setFecha_expiracion(LocalDate.of(2099, 1, 1));

        assertThatThrownBy(() -> service.crearPromocion(dto))
                .hasMessage("La fecha de inicio no puede ser posterior a la fecha de expiración");
        verify(repositorio, never()).save(any());
    }
}
