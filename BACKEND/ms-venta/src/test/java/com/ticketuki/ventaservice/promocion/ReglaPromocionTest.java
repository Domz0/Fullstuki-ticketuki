package com.ticketuki.ventaservice.promocion;

import com.ticketuki.ventaservice.promocion.model.ReglaPromocion;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;


class ReglaPromocionTest {
    @Test void unaPromocionSoloCreditoRechazaOtroMedioDePago() {
        assertThatCode(() -> ReglaPromocion.SOLO_CREDITO.validar("CREDITO", 1)).doesNotThrowAnyException();
        assertThatThrownBy(() -> ReglaPromocion.SOLO_CREDITO.validar("DEBITO", 1))
                .hasMessage("La promoción no corresponde al medio de pago");
    }

    @Test void unaPromocionMinimo4ExigeCuatroEntradas() {
        assertThatThrownBy(() -> ReglaPromocion.MINIMO_4.validar("DEBITO", 3))
                .hasMessage("La promoción requiere al menos 4 tickets por detalle");
        assertThatCode(() -> ReglaPromocion.MINIMO_4.validar("DEBITO", 4)).doesNotThrowAnyException();
    }
}
