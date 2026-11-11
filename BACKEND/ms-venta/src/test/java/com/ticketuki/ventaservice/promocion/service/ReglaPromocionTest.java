package com.ticketuki.ventaservice.promocion.service;

import com.ticketuki.ventaservice.promocion.model.ReglaPromocion;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class ReglaPromocionTest {
    @Test void exigeMedioDePago() {
        assertThatCode(() -> ReglaPromocion.SOLO_CREDITO.validar("CREDITO",1)).doesNotThrowAnyException();
        assertThatThrownBy(() -> ReglaPromocion.SOLO_CREDITO.validar("DEBITO",1)).isInstanceOf(IllegalArgumentException.class);
    }
    @Test void exigeCantidadMinima() {
        assertThatThrownBy(() -> ReglaPromocion.MINIMO_4.validar("DEBITO",3)).isInstanceOf(IllegalArgumentException.class);
        assertThatCode(() -> ReglaPromocion.MINIMO_4.validar("DEBITO",4)).doesNotThrowAnyException();
    }
    @Test void textoAntiguoNoSeAplicaComoDescuentoLibre() {
        assertThatThrownBy(() -> ReglaPromocion.desde("Solo banco X")).isInstanceOf(IllegalArgumentException.class);
        assertThat(ReglaPromocion.desde("sin_restriccion")).isEqualTo(ReglaPromocion.SIN_RESTRICCION);
    }
}
