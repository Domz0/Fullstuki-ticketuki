package com.ticketuki.ventaservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    @Value("${internal.service-key:${INTERNAL_SERVICE_KEY:}}")
    private String clave;

    @Bean("usuarioWebClient")
    public WebClient usuarioWebClient(@Value("${ms.usuario.url:http://localhost:8001}") String url) {
        return com.ticketuki.common.http.HttpServicios.builder(clave).baseUrl(url).build();
    }

    @Bean("ticketWebClient")
    public WebClient ticketWebClient(@Value("${ms.ticket.url:http://localhost:8005}") String url) {
        return com.ticketuki.common.http.HttpServicios.builder(clave).baseUrl(url).build();
    }

    @Bean("recintoWebClient")
    public WebClient recintoWebClient(@Value("${ms.recinto.url:http://localhost:8008}") String url) {
        return com.ticketuki.common.http.HttpServicios.builder(clave).baseUrl(url).build();
    }

    @Bean("eventoWebClient")
    public WebClient eventoWebClient(@Value("${ms.evento.url:http://localhost:8003}") String url) {
        return com.ticketuki.common.http.HttpServicios.builder(clave).baseUrl(url).build();
    }
}
