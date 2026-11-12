package com.ticketuki.ventaservice.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketuki.ventaservice.dto.CompraRequestDTO;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.LocalDateTime;
import java.util.Map;

@Component
public class TicketsCompraClient {
    private final WebClient client;
    private final ObjectMapper mapper;
    private final String clave;

    public record Reserva(String estado, LocalDateTime vence_en) {}

    public TicketsCompraClient(@Qualifier("ticketWebClient") WebClient client, ObjectMapper mapper,
            @Value("${internal.service-key:${INTERNAL_SERVICE_KEY:}}") String clave) {
        this.client = client; this.mapper = mapper; this.clave = clave;
    }

    private Object cuerpo(Long venta, String solicitud) {
        CompraRequestDTO compra;
        try { compra = mapper.readValue(solicitud, CompraRequestDTO.class); }
        catch (Exception ex) { throw new IllegalStateException("Solicitud de compra inválida", ex); }
        var titulares = compra.titulares().stream().map(t -> Map.of(
                "venta_id_venta", venta, "evento_id_evento", t.evento_id_evento(),
                "sector_id_sector", t.sector_id_sector(), "num_asiento", t.num_asiento(),
                "nombre_titular", t.nombre_titular(), "run_titular", t.run_titular())).toList();
        return Map.of("tickets", titulares);
    }

    public void emitir(Long venta, String solicitud) {
        enviar("/interno/ventas/" + venta + "/tickets", cuerpo(venta, solicitud), Void.class);
    }

    public Reserva reservar(Long venta, String solicitud) {
        return comprobar(enviar("/interno/ventas/" + venta + "/reserva", cuerpo(venta, solicitud), Reserva.class));
    }

    public Reserva confirmarReserva(Long venta) {
        return comprobar(enviar("/interno/ventas/" + venta + "/reserva/confirmar", Map.of(), Reserva.class));
    }

    public Reserva consultarReserva(Long venta) {
        comprobarClave();
        return comprobar(com.ticketuki.common.http.HttpServicios.ejecutar(client.get().uri("/interno/ventas/" + venta + "/reserva").header("X-Internal-Key", clave)
                .retrieve().bodyToMono(Reserva.class), Reserva.class));
    }

    public void cancelar(Long venta) { enviar("/interno/ventas/" + venta + "/cancelar", Map.of(), Void.class); }

    private Reserva comprobar(Reserva reserva) {
        if (reserva == null || reserva.estado() == null
                || ("RESERVADA".equals(reserva.estado()) && reserva.vence_en() == null))
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Respuesta de reserva inválida");
        return reserva;
    }

    private void comprobarClave() {
        if (clave.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Falta INTERNAL_SERVICE_KEY");
    }

    private <T> T enviar(String ruta, Object body, Class<T> tipo) {
        comprobarClave();
        return com.ticketuki.common.http.HttpServicios.ejecutar(client.post().uri(ruta).header("X-Internal-Key", clave).bodyValue(body)
                .retrieve().bodyToMono(tipo), tipo);
    }
}
