package com.ticketuki.ventaservice.client;

import com.ticketuki.ventaservice.dto.DetalleVentaRequestDTO;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.*;
import reactor.core.publisher.Mono;
import java.time.LocalDate;
import java.util.List;
import static org.assertj.core.api.Assertions.*;

class CatalogoVentaClientTest {
    WebClient respuesta(String body, HttpStatus status) {
        return WebClient.builder().exchangeFunction(r -> Mono.just(ClientResponse.create(status)
            .header("Content-Type", "application/json").body(body).build())).build();
    }
    CatalogoVentaClient catalogo(long recintoSector, long emitidos) {
        var sector = respuesta("{\"id_sector\":1,\"precio_sector\":10000,\"capacidad_sector\":10,\"recinto_id_recinto\":" + recintoSector + "}", HttpStatus.OK);
        var evento = respuesta("{\"id_evento\":1,\"aforo_evento\":10,\"fecha_evento\":\"" + LocalDate.now().plusDays(1) +
            "\",\"estado_evento_id_estado\":2,\"recinto_id_recinto\":1}", HttpStatus.OK);
        var tickets = respuesta("{\"emitidos_evento\":" + emitidos + ",\"emitidos_sector\":" + emitidos + "}", HttpStatus.OK);
        return new CatalogoVentaClient(sector, evento, respuesta("{\"id_usuario\":3}", HttpStatus.OK), tickets);
    }
    DetalleVentaRequestDTO detalle(int cantidad) {
        return new DetalleVentaRequestDTO(cantidad, 1L, 3L, 1L, null, 1L);
    }
    @Test void precioSaleDelCatalogoAunqueClienteEnvieUnPeso() {
        assertThat(catalogo(1, 0).precioPara(detalle(1))).isEqualTo(10000L);
    }
    @Test void rechazaSectorDeOtroRecinto() {
        assertThatThrownBy(() -> catalogo(2, 0).precioPara(detalle(1)))
            .isInstanceOf(IllegalArgumentException.class);
    }
    @Test void sumaLineasDelMismoEventoAntesDeComprobarCupos() {
        assertThatThrownBy(() -> catalogo(1, 7).validarCupos(List.of(detalle(2), detalle(2))))
            .isInstanceOf(IllegalArgumentException.class);
        assertThatCode(() -> catalogo(1, 6).validarCupos(List.of(detalle(2), detalle(2))))
            .doesNotThrowAnyException();
    }
    @Test void noUsaPrecioDelClienteSiCatalogoFalla() {
        var caido = respuesta("{}", HttpStatus.SERVICE_UNAVAILABLE);
        assertThatThrownBy(() -> new CatalogoVentaClient(caido, caido, caido, caido).precioPara(detalle(1)))
            .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
    }
}
