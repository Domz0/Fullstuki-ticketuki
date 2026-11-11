package com.ticketuki.gateway.security;

import org.springframework.http.HttpMethod;
import java.util.Set;

public final class PoliticaRoles {
    private PoliticaRoles() {}

    public static boolean publica(String path, HttpMethod method) {
        return method == HttpMethod.POST && Set.of("/auth/login", "/auth/registro").contains(path);
    }

    public static boolean permite(String rol, String path, HttpMethod method) {
        if (rol == null || !Set.of("ADMIN", "CLIENTE").contains(rol)) return false;
        if (path.contains("..") || path.contains(";") || path.contains("//") || path.contains("\\")) return false;
        if (path.equals("/auth/me")) return method == HttpMethod.GET;
        if (path.equals("/auth/contrasena")) return method == HttpMethod.PATCH;
        if (path.matches("/auth/cuentas(/[0-9]+/(activo|rol))?"))
            return "ADMIN".equals(rol) && (method == HttpMethod.GET || method == HttpMethod.PATCH);
        String raiz = path.split("/", -1).length > 1 ? path.split("/", -1)[1] : "";
        if (!Set.of("usuarios", "eventos", "recintos", "sectores", "promociones",
                "estadosEvento", "estadosTicket", "estadosVenta", "compras", "ventas", "detalleVenta", "pagos", "tickets", "historial").contains(raiz))
            return false;
        if (raiz.equals("historial")) return "ADMIN".equals(rol) && method == HttpMethod.GET;
        if ("ADMIN".equals(rol)) return true;
        if (method == HttpMethod.GET && path.matches("/tickets/disponibilidad/[0-9]+/[0-9]+")) return true;
        if (Set.of("eventos", "recintos", "sectores", "promociones", "estadosEvento", "estadosTicket", "estadosVenta").contains(raiz))
            return method == HttpMethod.GET;
        if (path.matches("/usuarios/[0-9]+")) return method == HttpMethod.GET || method == HttpMethod.PUT;
        if (method == HttpMethod.POST) return path.equals("/compras") || path.equals("/ventas") || path.equals("/pagos");
        if (method == HttpMethod.PUT)
            return path.matches("/tickets/[0-9]+(/transferir)?") || path.matches("/pagos/[0-9]+/cancelar");
        return method == HttpMethod.GET && (path.matches("/compras/[0-9]+") || path.matches("/pagos/[0-9]+/operacion") || path.matches("/tickets/venta/[0-9]+") || path.matches("/ventas/[0-9]+")
                || path.matches("/detalleVenta/([0-9]+|venta/[0-9]+)")
                || path.matches("/pagos/([0-9]+|usuario/[0-9]+|venta/[0-9]+)")
                || path.matches("/tickets/([0-9]+|titular/[^/]+)"));
    }
}
