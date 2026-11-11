package com.ticketuki.common.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.client.RestClient;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

@org.springframework.boot.autoconfigure.AutoConfiguration(after = org.springframework.boot.autoconfigure.jdbc.JdbcTemplateAutoConfiguration.class)
@org.springframework.boot.autoconfigure.condition.ConditionalOnClass(JdbcTemplate.class)
@org.springframework.boot.autoconfigure.condition.ConditionalOnBean(JdbcTemplate.class)
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "audit.enabled", havingValue = "true")
@EnableScheduling
@EnableAspectJAutoProxy
@EnableTransactionManagement(order = 0)
public class AuditoriaConfig {
    @Bean
    AuditoriaAspect auditoriaAspect(JdbcTemplate jdbc, ObjectMapper mapper,
            @Value("${spring.application.name}") String origen) {
        return new AuditoriaAspect(jdbc, mapper, origen);
    }
    @Bean
    AuditoriaPublisher auditoriaPublisher(JdbcTemplate jdbc,
            @Value("${ms.historial.url:http://localhost:8010}") String url,
            @Value("${internal.service-key:${INTERNAL_SERVICE_KEY:}}") String key) {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000);
        factory.setReadTimeout(3000);
        return new AuditoriaPublisher(jdbc, RestClient.builder().baseUrl(url).requestFactory(factory).build(), key);
    }
}
