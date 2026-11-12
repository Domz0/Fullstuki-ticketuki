package com.ticketuki.common.security;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;

@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
public class AccesoServicioConfig {
    @Bean
    public com.ticketuki.common.validation.ValidacionDatos validacionDatos(jakarta.validation.Validator validator) {
        return new com.ticketuki.common.validation.ValidacionDatos(validator);
    }

    @Bean
    public AccesoServicio accesoServicio(
            @Value("${ms.auth.url:${MS_AUTH_URL:http://localhost:8011}}") String auth,
            @Value("${ms.usuario.url:${MS_USUARIO_URL:http://localhost:8001}}") String usuarios,
            @Value("${internal.service-key:${INTERNAL_SERVICE_KEY:}}") String clave) {
        return new AccesoServicio(auth, usuarios, clave);
    }
}