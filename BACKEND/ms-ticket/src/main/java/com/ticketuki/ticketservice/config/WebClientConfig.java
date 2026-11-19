package com.ticketuki.ticketservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    @Value("${internal.service-key:${INTERNAL_SERVICE_KEY:}}")
    private String clave;

    @Value("${ms.evento.url:http://localhost:8003}")
    private String eventoUrl;

    @Value("${ms.recinto.url:http://localhost:8008}")
    private String recintoUrl;

    @Value("${ms.venta.url:http://localhost:8006}")
    private String ventaUrl;

    @Bean("usuarioWebClient")
    public WebClient usuarioWebClient(@Value("${ms.usuario.url:http://localhost:8001}") String usuarioUrl) {
        return com.ticketuki.common.http.HttpServicios.builder(clave).baseUrl(usuarioUrl).build();
    }

    @Bean("eventoWebClient")
    public WebClient eventoWebClient() {
        return com.ticketuki.common.http.HttpServicios.builder(clave).baseUrl(eventoUrl).build();
    }

    @Bean("recintoWebClient")
    public WebClient recintoWebClient() {
        return com.ticketuki.common.http.HttpServicios.builder(clave).baseUrl(recintoUrl).build();
    }

    @Bean("ventaWebClient")
    public WebClient ventaWebClient() {
        return com.ticketuki.common.http.HttpServicios.builder(clave).baseUrl(ventaUrl).build();
    }
}
