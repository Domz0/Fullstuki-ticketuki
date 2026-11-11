package com.ticketuki.ticketservice.util;

import java.util.Locale;

public final class RunUtil {
    private RunUtil() {}

    public static String normalizar(String run) {
        if (run == null) return null;
        String valor = run.trim().toUpperCase(Locale.ROOT);
        if (valor.matches("[0-9]{7,8}-[0-9K]")) {
            valor = valor.replaceFirst("^([0-9]{1,2})([0-9]{3})([0-9]{3})(-[0-9K])$", "$1.$2.$3$4");
        }
        return valor;
    }
}
