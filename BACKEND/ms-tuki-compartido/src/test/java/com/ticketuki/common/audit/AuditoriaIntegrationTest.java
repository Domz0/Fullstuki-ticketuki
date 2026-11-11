package com.ticketuki.common.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.autoconfigure.jdbc.*;
import org.springframework.boot.autoconfigure.transaction.TransactionAutoConfiguration;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import static org.assertj.core.api.Assertions.*;

class AuditoriaIntegrationTest {
    ApplicationContextRunner context = new ApplicationContextRunner()
        .withConfiguration(AutoConfigurations.of(DataSourceAutoConfiguration.class, JdbcTemplateAutoConfiguration.class,
            DataSourceTransactionManagerAutoConfiguration.class, TransactionAutoConfiguration.class, AuditoriaConfig.class))
        .withUserConfiguration(Config.class)
        .withPropertyValues("audit.enabled=true", "spring.application.name=prueba",
            "audit.initial-delay-ms=3600000", "spring.datasource.generate-unique-name=true");

    @Configuration(proxyBeanMethods = false)
    static class Config {
        @Bean ObjectMapper mapper() { return new ObjectMapper().findAndRegisterModules(); }
        @Bean Operaciones operaciones(JdbcTemplate jdbc) { return new Operaciones(jdbc); }
    }
    public record Resultado(long id) {}
    static class Operaciones {
        private final JdbcTemplate jdbc;
        Operaciones(JdbcTemplate jdbc) { this.jdbc = jdbc; }

        @Transactional
        @Auditar(entidad="VENTA", accion="CREAR", id="id")
        public Resultado crear(boolean fallar) {
            jdbc.update("INSERT INTO negocio VALUES (1)");
            if (fallar) throw new IllegalArgumentException("rechazado");
            return new Resultado(1);
        }
    }
    void tablas(JdbcTemplate jdbc) {
        jdbc.execute("CREATE TABLE negocio (id BIGINT PRIMARY KEY)");
        jdbc.execute("CREATE TABLE auditoria_pendiente (id VARCHAR(36) PRIMARY KEY, payload TEXT, creado TIMESTAMP, enviado TIMESTAMP)");
    }
    @Test void guardaEventoYOperacionEnLaMismaTransaccion() {
        context.run(ctx -> {
            assertThat(ctx).hasNotFailed().hasSingleBean(AuditoriaAspect.class);
            var jdbc = ctx.getBean(JdbcTemplate.class);
            tablas(jdbc);
            ctx.getBean(Operaciones.class).crear(false);
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM negocio", Integer.class)).isEqualTo(1);
            String payload = jdbc.queryForObject("SELECT payload FROM auditoria_pendiente", String.class);
            assertThat(payload).contains("\"operacion\":\"crear\"").doesNotContain("password", "Bearer");
        });
    }
    @Test void operacionRechazadaNoDejaEventoNiCambios() {
        context.run(ctx -> {
            var jdbc = ctx.getBean(JdbcTemplate.class);
            tablas(jdbc);
            assertThatThrownBy(() -> ctx.getBean(Operaciones.class).crear(true)).isInstanceOf(IllegalArgumentException.class);
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM negocio", Integer.class)).isZero();
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM auditoria_pendiente", Integer.class)).isZero();
        });
    }
    @Test void falloDeOutboxRevierteOperacionDeNegocio() {
        context.run(ctx -> {
            var jdbc = ctx.getBean(JdbcTemplate.class);
            jdbc.execute("CREATE TABLE negocio (id BIGINT PRIMARY KEY)");
            assertThatThrownBy(() -> ctx.getBean(Operaciones.class).crear(false)).isInstanceOf(Exception.class);
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM negocio", Integer.class)).isZero();
        });
    }
}
