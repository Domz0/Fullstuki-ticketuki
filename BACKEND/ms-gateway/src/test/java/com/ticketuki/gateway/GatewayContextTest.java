package com.ticketuki.gateway;

import com.ticketuki.gateway.security.JwtAuthFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK,
    properties = {"spring.main.web-application-type=reactive", "INTERNAL_SERVICE_KEY=prueba-interna"})
class GatewayContextTest {
    @Autowired ApplicationContext context;
    @Test void bibliotecaCompartidaNoAgregaBaseDeDatosAlGateway() {
        assertThat(context.getBean(JwtAuthFilter.class)).isNotNull();
        assertThat(context.getBeanNamesForType(javax.sql.DataSource.class)).isEmpty();
    }
}
