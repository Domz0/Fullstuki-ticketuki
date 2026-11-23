package com.ticketuki.ventaservice.dto;

import com.ticketuki.ventaservice.pago.model.MedioPago;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;


class CompraPublicaDTOTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    private CompraPublicaDTO compra(int cantidad, String rut, String correo) {
        return new CompraPublicaDTO("clave-de-prueba-123456", 7L, 2L, cantidad, "Ana Rojas", rut, correo, MedioPago.DEBITO, null);
    }

    private java.util.Set<String> camposInvalidos(CompraPublicaDTO dto) {
        return validator.validate(dto).stream().map(v -> v.getPropertyPath().toString())
                .collect(java.util.stream.Collectors.toSet());
    }

    @Test void aceptaUnaCompraCorrectaDeHastaSeisEntradas() {
        assertThat(camposInvalidos(compra(6, "12.345.678-5", "ana@duoc.cl"))).isEmpty();
    }

    @Test void noPermiteMasDeSeisEntradasNiCero() {
        assertThat(camposInvalidos(compra(7, "12.345.678-5", "ana@duoc.cl"))).containsExactly("cantidad");
        assertThat(camposInvalidos(compra(0, "12.345.678-5", "ana@duoc.cl"))).containsExactly("cantidad");
    }

    @Test void exigeRutConPuntosYUnCorreoPermitido() {
        assertThat(camposInvalidos(compra(1, "12345678-5", "ana@hotmail.com"))).containsExactlyInAnyOrder("rut", "correo");
    }
}
