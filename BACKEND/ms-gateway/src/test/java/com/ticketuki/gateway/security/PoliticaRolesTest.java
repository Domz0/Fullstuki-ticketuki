package com.ticketuki.gateway.security;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import static org.assertj.core.api.Assertions.*;

class PoliticaRolesTest {
    @Test void rutasPublicasSonExactas() {
        assertThat(PoliticaRoles.publica("/auth/registro", HttpMethod.POST)).isTrue();
        assertThat(PoliticaRoles.publica("/auth/login/extra", HttpMethod.POST)).isFalse();
        assertThat(PoliticaRoles.publica("/auth/registro", HttpMethod.GET)).isFalse();
    }
    @Test void clienteNoAdministraNiValidaTickets() {
        assertThat(PoliticaRoles.permite("CLIENTE", "/eventos", HttpMethod.GET)).isTrue();
        assertThat(PoliticaRoles.permite("CLIENTE", "/eventos", HttpMethod.POST)).isFalse();
        assertThat(PoliticaRoles.permite("CLIENTE", "/usuarios", HttpMethod.GET)).isFalse();
        assertThat(PoliticaRoles.permite("CLIENTE", "/tickets/validar/QR", HttpMethod.POST)).isFalse();
        assertThat(PoliticaRoles.permite("CLIENTE", "/pagos/1/completar", HttpMethod.PUT)).isFalse();
        assertThat(PoliticaRoles.permite("CLIENTE", "/historial", HttpMethod.GET)).isFalse();
    }
    @Test void vendedorRetiradoNoTieneAcceso() {
        assertThat(PoliticaRoles.permite("VENDEDOR", "/tickets/validar/QR", HttpMethod.POST)).isFalse();
        assertThat(PoliticaRoles.permite("VENDEDOR", "/pagos/1/completar", HttpMethod.PUT)).isFalse();
        assertThat(PoliticaRoles.permite("VENDEDOR", "/eventos/1", HttpMethod.DELETE)).isFalse();
        assertThat(PoliticaRoles.permite("VENDEDOR", "/pagos/1/reembolso", HttpMethod.PUT)).isFalse();
    }
    @Test void rechazaRolesYRutasDesconocidos() {
        assertThat(PoliticaRoles.permite("SUPERADMIN", "/usuarios", HttpMethod.GET)).isFalse();
        assertThat(PoliticaRoles.permite("ADMIN", "/interno/registros/1", HttpMethod.POST)).isFalse();
        assertThat(PoliticaRoles.permite("ADMIN", "/eventos/../usuarios", HttpMethod.GET)).isFalse();
        assertThat(PoliticaRoles.permite("ADMIN", "/eventos", HttpMethod.POST)).isTrue();
    }

    @Test void cuentasSoloAdminEHistorialSoloLectura() {
        assertThat(PoliticaRoles.permite("CLIENTE", "/auth/me", HttpMethod.GET)).isTrue();
        assertThat(PoliticaRoles.permite("CLIENTE", "/auth/contrasena", HttpMethod.PATCH)).isTrue();
        assertThat(PoliticaRoles.permite("CLIENTE", "/auth/cuentas", HttpMethod.GET)).isFalse();
        assertThat(PoliticaRoles.permite("ADMIN", "/auth/cuentas/2/activo", HttpMethod.PATCH)).isTrue();
        assertThat(PoliticaRoles.permite("ADMIN", "/historial", HttpMethod.POST)).isFalse();
        assertThat(PoliticaRoles.permite("ADMIN", "/historial", HttpMethod.GET)).isTrue();
    }
    @org.junit.jupiter.api.Test void compraNoAutorizaConfirmarPagoNiOperacionesInternas() {
        org.assertj.core.api.Assertions.assertThat(PoliticaRoles.permite("CLIENTE","/compras",org.springframework.http.HttpMethod.POST)).isTrue();
        org.assertj.core.api.Assertions.assertThat(PoliticaRoles.permite("CLIENTE","/compras/1",org.springframework.http.HttpMethod.GET)).isTrue();
        org.assertj.core.api.Assertions.assertThat(PoliticaRoles.permite("CLIENTE","/pagos/1/completar",org.springframework.http.HttpMethod.PUT)).isFalse();
        org.assertj.core.api.Assertions.assertThat(PoliticaRoles.permite("CLIENTE","/pagos/1/reintentar",org.springframework.http.HttpMethod.POST)).isFalse();
        org.assertj.core.api.Assertions.assertThat(PoliticaRoles.permite("ADMIN","/interno/ventas/1/tickets",org.springframework.http.HttpMethod.POST)).isFalse();
    }
}
