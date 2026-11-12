package com.ticketuki.common.http;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.web.reactive.function.client.WebClientCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.client.WebClient;

@AutoConfiguration
@ConditionalOnClass(WebClient.class)
public class HttpServiciosConfig {
    @Bean
    public WebClientCustomizer serviciosWebClientCustomizer(
            @Value("${internal.service-key:${INTERNAL_SERVICE_KEY:}}") String clave) {
        return builder -> HttpServicios.configurar(builder, clave);
    }
}