package com.ticketuki.ventaservice.model;

public enum EstadoVenta {
    PENDIENTE(1L), CONFIRMADA(2L), CANCELADA(3L), REEMBOLSADA(4L), ANULADA(5L);

    private final Long id;

    EstadoVenta(Long id) { this.id = id; }

    public Long getId() { return id; }

    public static EstadoVenta fromId(Long id) {
        if (id == null) return null;
        for (EstadoVenta estado : values()) {
            if (estado.id.equals(id)) return estado;
        }
        throw new IllegalArgumentException("Estado de venta no encontrado: " + id);
    }
}
