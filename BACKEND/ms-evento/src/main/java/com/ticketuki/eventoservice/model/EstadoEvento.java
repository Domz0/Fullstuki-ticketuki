package com.ticketuki.eventoservice.model;

public enum EstadoEvento {
    AGENDADO(1L), DISPONIBLE(2L), CANCELADO(3L), FINALIZADO(4L);

    private final Long id;

    EstadoEvento(Long id) { this.id = id; }

    public Long getId() { return id; }

    public static EstadoEvento fromId(Long id) {
        if (id == null) return null;
        for (EstadoEvento estado : values()) {
            if (estado.id.equals(id)) return estado;
        }
        throw new IllegalArgumentException("Estado de evento no encontrado: " + id);
    }
}
