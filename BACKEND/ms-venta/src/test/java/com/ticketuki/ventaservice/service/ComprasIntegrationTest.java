package com.ticketuki.ventaservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketuki.ventaservice.client.TicketsCompraClient;
import com.ticketuki.ventaservice.dto.*;
import com.ticketuki.ventaservice.pago.dto.PagoResponseDTO;
import com.ticketuki.ventaservice.pago.model.*;
import com.ticketuki.ventaservice.pago.repository.PagoRepository;
import com.ticketuki.ventaservice.pago.service.PagoService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.*;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.*;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import javax.sql.DataSource;
import java.time.LocalDateTime;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringJUnitConfig(ComprasIntegrationTest.Config.class)
class ComprasIntegrationTest {
    @Configuration @EnableTransactionManagement
    static class Config {
        @Bean DataSource dataSource() { return new DriverManagerDataSource("jdbc:h2:mem:compras;MODE=MariaDB;DB_CLOSE_DELAY=-1","sa",""); }
        @Bean JdbcTemplate jdbc(DataSource ds) { return new JdbcTemplate(ds); }
        @Bean PlatformTransactionManager transactionManager(DataSource ds) { return new DataSourceTransactionManager(ds); }
        @Bean VentaService ventas() { return mock(VentaService.class); }
        @Bean PagoService pagos() { return mock(PagoService.class); }
        @Bean PagoRepository repository() { return mock(PagoRepository.class); }
        @Bean TicketsCompraClient tickets() { return mock(TicketsCompraClient.class); }
        @Bean ObjectMapper mapper() { return new ObjectMapper().findAndRegisterModules(); }
        @Bean CompraService compras(JdbcTemplate jdbc, VentaService ventas, PagoService pagos, ObjectMapper mapper) {
            return new CompraService(jdbc,ventas,pagos,mapper);
        }
        @Bean CompraProcesador procesador(JdbcTemplate jdbc, PagoRepository repo, PagoService pagos, TicketsCompraClient tickets, PlatformTransactionManager tm) {
            return new CompraProcesador(jdbc,repo,pagos,tickets,tm);
        }
        @Bean PagoTareas tareas(JdbcTemplate jdbc) { return new PagoTareas(jdbc); }
    }
    @Autowired CompraService compras;
    @Autowired CompraProcesador procesador;
    @Autowired PagoTareas tareas;
    @Autowired JdbcTemplate jdbc;
    @Autowired VentaService ventas;
    @Autowired PagoService pagos;
    @Autowired PagoRepository repository;
    @Autowired TicketsCompraClient tickets;

    @BeforeEach void preparar() {
        reset(ventas,pagos,repository,tickets);
        jdbc.execute("DROP ALL OBJECTS");
        jdbc.execute("CREATE TABLE venta(id_venta BIGINT PRIMARY KEY)");
        jdbc.execute("CREATE TABLE pago(id_pago BIGINT PRIMARY KEY, estado VARCHAR(25))");
        var script = new org.springframework.core.io.ClassPathResource("db/migration/V14__compras_y_tareas.sql");
        org.springframework.jdbc.datasource.init.DatabasePopulatorUtils.execute(
                new org.springframework.jdbc.datasource.init.ResourceDatabasePopulator(script),jdbc.getDataSource());
        when(ventas.crearVenta(any())).thenAnswer(i -> {
            jdbc.update("INSERT INTO venta VALUES(1)");
            var respuesta = new VentaResponseDTO();
            respuesta.setId_venta(1L); respuesta.setMonto_total(12900L);
            return respuesta;
        });
        when(pagos.procesarPago(any())).thenAnswer(i -> {
            jdbc.update("INSERT INTO pago VALUES(1,'PENDIENTE')");
            return new PagoResponseDTO(1L,12900L,MedioPago.CREDITO,"SIMULADO",LocalDateTime.now(),EstadoPago.PENDIENTE,1L,2L);
        });
        when(repository.findForUpdate(1L)).thenAnswer(i -> Optional.of(new Pago(1L,12900L,MedioPago.CREDITO,
                "SIMULADO",LocalDateTime.now(),EstadoPago.valueOf(jdbc.queryForObject("SELECT estado FROM pago WHERE id_pago=1",String.class)),1L,2L)));
        when(pagos.finalizarCancelacion(eq(1L),anyBoolean())).thenAnswer(i -> {
            jdbc.update("UPDATE pago SET estado=? WHERE id_pago=1", i.<Boolean>getArgument(1) ? "REEMBOLSADO" : "CANCELADO");
            return null;
        });
    }
    CompraRequestDTO solicitud() {
        return new CompraRequestDTO("pedido-uno",new VentaRequestDTO("CREDITO","SIMULADO",1L,
                List.of(new DetalleVentaRequestDTO(1,null,2L,1L,null,1L))),
                List.of(new CompraRequestDTO.Titular(1L,1L,1,"Juan","12.345.678-9")));
    }
    void pagada() {
        compras.crear(solicitud());
        jdbc.update("UPDATE pago SET estado='COMPLETADO'");
        tareas.solicitar(1L,"EMITIR");
    }
    String estadoTarea() { return jdbc.queryForObject("SELECT estado FROM pago_tarea WHERE pago_id=1",String.class); }
    WebClientResponseException error(int status) {
        return WebClientResponseException.create(status,"Error",org.springframework.http.HttpHeaders.EMPTY,new byte[0],null);
    }

    @Test void compraRepetidaDevuelveLaMismaVentaYPago() {
        var primera = compras.crear(solicitud());
        var segunda = compras.crear(solicitud());
        assertThat(segunda).isEqualTo(primera);
        verify(ventas,times(1)).crearVenta(any());
        verify(pagos,times(1)).procesarPago(any());
    }

    @Test void claveReutilizadaConOtrosDatosSeRechaza() {
        compras.crear(solicitud());
        var distinta = solicitud();
        distinta.venta().setCod_autorizacion("OTRA");
        assertThatThrownBy(() -> compras.crear(distinta)).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM compra",Long.class)).isEqualTo(1L);
    }

    @Test void falloDePagoRevierteCompraYVenta() {
        when(pagos.procesarPago(any())).thenThrow(new IllegalArgumentException("Pago inválido"));
        assertThatThrownBy(() -> compras.crear(solicitud())).isInstanceOf(IllegalArgumentException.class);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM compra",Long.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM venta",Long.class)).isZero();
    }

    @Test void caidaRemotaConservaTareaYReintentaLaMismaCompra() {
        pagada();
        doThrow(error(503)).doNothing().when(tickets).emitir(eq(1L),anyString());
        procesador.procesar(1L);
        assertThat(estadoTarea()).isEqualTo("PENDIENTE");
        procesador.procesar(1L);
        procesador.procesar(1L);
        assertThat(estadoTarea()).isEqualTo("HECHA");
        assertThat(compras.obtener(1L).estado()).isEqualTo("COMPLETADA");
        verify(tickets,times(2)).emitir(eq(1L),anyString());
    }

    @Test void sinCupoCancelaTicketsAntesDeReembolsar() {
        pagada();
        doThrow(error(422)).when(tickets).emitir(eq(1L),anyString());
        procesador.procesar(1L);
        assertThat(compras.obtener(1L).estado()).isEqualTo("REEMBOLSANDO");
        procesador.procesar(1L);
        assertThat(compras.obtener(1L).estado()).isEqualTo("REEMBOLSADA");
        var orden = inOrder(tickets,pagos);
        orden.verify(tickets).cancelar(1L);
        orden.verify(pagos).finalizarCancelacion(1L,true);
    }

    @Test void ticketUsadoNoProduceReembolsoNiReintentoInfinito() {
        pagada();
        tareas.solicitar(1L,"REEMBOLSAR");
        doThrow(error(409)).when(tickets).cancelar(1L);
        procesador.procesar(1L);
        assertThat(estadoTarea()).isEqualTo("RECHAZADA");
        assertThat(compras.obtener(1L).estado()).isEqualTo("REVISION_REQUERIDA");
        verify(pagos,never()).finalizarCancelacion(anyLong(),anyBoolean());
        procesador.procesar(1L);
        verify(tickets,times(1)).cancelar(1L);
    }

    @Test void falloLocalTrasCancelacionRemotaSeRecuperaRepitiendo() {
        pagada();
        tareas.solicitar(1L,"REEMBOLSAR");
        when(pagos.finalizarCancelacion(1L,true)).thenThrow(new IllegalStateException("fallo local")).thenAnswer(i -> {
            jdbc.update("UPDATE pago SET estado='REEMBOLSADO'");
            return null;
        });
        assertThatThrownBy(() -> procesador.procesar(1L)).isInstanceOf(IllegalStateException.class);
        assertThat(estadoTarea()).isEqualTo("PENDIENTE");
        procesador.procesar(1L);
        assertThat(compras.obtener(1L).estado()).isEqualTo("REEMBOLSADA");
        verify(tickets,times(2)).cancelar(1L);
    }

    @Test void titularesDebenCoincidirConCantidadYAsientosUnicos() {
        var una = solicitud();
        var duplicada = new CompraRequestDTO("otra",una.venta(),List.of(una.titulares().getFirst(),una.titulares().getFirst()));
        assertThatThrownBy(() -> compras.crear(duplicada)).isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(ventas,pagos);
    }
}
