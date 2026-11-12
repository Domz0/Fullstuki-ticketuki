package com.ticketuki.eventoservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    @Value("${internal.service-key:${INTERNAL_SERVICE_KEY:}}")
    private String clave;

    @Value("${ms.recinto.url:http://localhost:8008}")
    private String recintoUrl;

    @Bean("recintoWebClient")
    public WebClient recintoWebClient() {
        return com.ticketuki.common.http.HttpServicios.builder(clave)
                .baseUrl(recintoUrl)
                .build();
    }
}
