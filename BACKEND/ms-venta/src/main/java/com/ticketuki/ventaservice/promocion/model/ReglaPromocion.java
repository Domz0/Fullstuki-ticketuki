package com.ticketuki.ventaservice.promocion.model;

public enum ReglaPromocion {
    SIN_RESTRICCION, SOLO_CREDITO, SOLO_DEBITO, SOLO_TRANSFERENCIA, MINIMO_2, MINIMO_4;

    public static ReglaPromocion desde(String valor) {
        try { return valueOf(valor == null ? "" : valor.trim().toUpperCase(java.util.Locale.ROOT)); }
        catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Restricción no válida. Use SIN_RESTRICCION, SOLO_CREDITO, SOLO_DEBITO, SOLO_TRANSFERENCIA, MINIMO_2 o MINIMO_4");
        }
    }

    public static boolean reconocida(String valor) {
        try { desde(valor); return true; }
        catch (IllegalArgumentException ex) { return false; }
    }

    public void validar(String medio, int cantidad) {
        if (name().startsWith("SOLO_") && !name().substring(5).equals(medio))
            throw new IllegalArgumentException("La promoción no corresponde al medio de pago");
        int minimo = this == MINIMO_2 ? 2 : this == MINIMO_4 ? 4 : 1;
        if (cantidad < minimo) throw new IllegalArgumentException("La promoción requiere al menos " + minimo + " tickets por detalle");
    }
}
