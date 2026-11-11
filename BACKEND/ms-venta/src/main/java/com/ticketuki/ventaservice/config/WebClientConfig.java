package com.ticketuki.ventaservice.config;

import io.netty.resolver.DefaultAddressResolverGroup;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

@Configuration
public class WebClientConfig {

    // Usa el resolver DNS de la JVM (respeta /etc/hosts) en lugar del resolver
    // nativo de Netty, que en macOS no resuelve 'localhost' correctamente.
    private ReactorClientHttpConnector jvmDnsConnector() {
        HttpClient httpClient = HttpClient.create()
                .resolver(DefaultAddressResolverGroup.INSTANCE);
        return new ReactorClientHttpConnector(httpClient);
    }

    @Bean("usuarioWebClient")
    public WebClient usuarioWebClient(@Value("${ms.usuario.url:http://localhost:8001}") String url) {
        return WebClient.builder().baseUrl(url).clientConnector(jvmDnsConnector()).build();
    }

    @Bean("ticketWebClient")
    public WebClient ticketWebClient(@Value("${ms.ticket.url:http://localhost:8005}") String url) {
        return WebClient.builder().baseUrl(url).clientConnector(jvmDnsConnector()).build();
    }

    @Bean("recintoWebClient")
    public WebClient recintoWebClient(@Value("${ms.recinto.url:http://localhost:8008}") String url) {
        return WebClient.builder().baseUrl(url).clientConnector(jvmDnsConnector()).build();
    }

    @Bean("eventoWebClient")
    public WebClient eventoWebClient(@Value("${ms.evento.url:http://localhost:8003}") String url) {
        return WebClient.builder().baseUrl(url).clientConnector(jvmDnsConnector()).build();
    }
}
