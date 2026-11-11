package com.ticketuki.gateway.security;

import org.springframework.http.HttpMethod;
import java.util.Set;

public final class PoliticaRoles {
    private PoliticaRoles() {}

    public static boolean publica(String path, HttpMethod method) {
        return method == HttpMethod.POST && Set.of("/auth/login", "/auth/registro").contains(path);
    }

    public static boolean permite(String rol, String path, HttpMethod method) {
        if (rol == null || !Set.of("ADMIN", "VENDEDOR", "CLIENTE").contains(rol)) return false;
        if (path.contains("..") || path.contains(";") || path.contains("//") || path.contains("\\")) return false;
        String raiz = path.split("/", -1).length > 1 ? path.split("/", -1)[1] : "";
        if (!Set.of("usuarios", "eventos", "recintos", "sectores", "promociones",
                "estadosEvento", "estadosTicket", "estadosVenta", "ventas", "detalleVenta", "pagos", "tickets", "historial").contains(raiz))
            return false;
        if ("ADMIN".equals(rol)) return true;
        if (method == HttpMethod.GET && path.matches("/tickets/disponibilidad/[0-9]+/[0-9]+")) return true;
        if (Set.of("eventos", "recintos", "sectores", "promociones", "estadosEvento", "estadosTicket", "estadosVenta").contains(raiz))
            return method == HttpMethod.GET;
        if ("VENDEDOR".equals(rol)) {
            if (raiz.equals("usuarios")) return method == HttpMethod.GET;
            if (raiz.equals("historial")) return false;
            if (raiz.equals("ventas") || raiz.equals("detalleVenta"))
                return method == HttpMethod.GET || (path.equals("/ventas") && method == HttpMethod.POST);
            if (raiz.equals("pagos"))
                return method == HttpMethod.GET || (path.equals("/pagos") && method == HttpMethod.POST)
                        || (method == HttpMethod.PUT && path.matches("/pagos/[0-9]+/(completar|cancelar)"));
            return raiz.equals("tickets") && (method == HttpMethod.GET || method == HttpMethod.POST
                    || (method == HttpMethod.PUT && path.matches("/tickets/[0-9]+(/transferir)?")));
        }
        if (path.matches("/usuarios/[0-9]+")) return method == HttpMethod.GET || method == HttpMethod.PUT;
        if (method == HttpMethod.POST) return path.equals("/ventas") || path.equals("/pagos");
        if (method == HttpMethod.PUT)
            return path.matches("/tickets/[0-9]+(/transferir)?") || path.matches("/pagos/[0-9]+/cancelar");
        return method == HttpMethod.GET && (path.matches("/ventas/[0-9]+")
                || path.matches("/detalleVenta/([0-9]+|venta/[0-9]+)")
                || path.matches("/pagos/([0-9]+|usuario/[0-9]+|venta/[0-9]+)")
                || path.matches("/tickets/([0-9]+|titular/[^/]+)"));
    }
}
