package com.ticketuki.ventaservice.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketuki.ventaservice.dto.CompraRequestDTO;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.Duration;
import java.util.Map;

@Component
public class TicketsCompraClient {
    private final WebClient client;
    private final ObjectMapper mapper;
    private final String clave;

    public TicketsCompraClient(@Qualifier("ticketWebClient") WebClient client, ObjectMapper mapper,
            @Value("${internal.service-key:${INTERNAL_SERVICE_KEY:}}") String clave) {
        this.client = client; this.mapper = mapper; this.clave = clave;
    }

    public void emitir(Long venta, String solicitud) {
        CompraRequestDTO compra;
        try { compra = mapper.readValue(solicitud, CompraRequestDTO.class); }
        catch (Exception ex) { throw new IllegalStateException("Solicitud de compra inválida", ex); }
        var titulares = compra.titulares().stream().map(t -> Map.of(
                "venta_id_venta", venta, "evento_id_evento", t.evento_id_evento(),
                "sector_id_sector", t.sector_id_sector(), "num_asiento", t.num_asiento(),
                "nombre_titular", t.nombre_titular(), "run_titular", t.run_titular())).toList();
        enviar("/interno/ventas/" + venta + "/tickets", Map.of("tickets", titulares));
    }

    public void cancelar(Long venta) { enviar("/interno/ventas/" + venta + "/cancelar", Map.of()); }

    private void enviar(String ruta, Object body) {
        if (clave.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Falta INTERNAL_SERVICE_KEY");
        client.post().uri(ruta).header("X-Internal-Key", clave).bodyValue(body)
                .retrieve().toBodilessEntity().block(Duration.ofSeconds(5));
    }
}
