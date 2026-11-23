package com.ticketuki.gateway.config;

import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;


@Component
public class VersionApiFilter implements WebFilter, Ordered {
    public static final String VERSION = "/v1";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getURI().getRawPath();
        if (path.startsWith("/actuator")) return chain.filter(exchange);
        if (!path.startsWith(VERSION + "/")) return Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND));
        var request = exchange.getRequest().mutate().path(path.substring(VERSION.length())).build();
        return chain.filter(exchange.mutate().request(request).build());
    }


    @Override public int getOrder() { return Ordered.HIGHEST_PRECEDENCE; }
}
