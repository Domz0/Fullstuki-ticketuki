package com.ticketuki.ticketservice.model;

public enum EstadoTicket {
    VALIDO(1L), USADO(2L), CANCELADO(3L), TRANSFERIDO(4L);

    private final Long id;

    EstadoTicket(Long id) { this.id = id; }

    public Long getId() { return id; }

    public static EstadoTicket fromId(Long id) {
        if (id == null) return null;
        for (EstadoTicket estado : values()) {
            if (estado.id.equals(id)) return estado;
        }
        throw new IllegalArgumentException("Estado de ticket no encontrado: " + id);
    }
}
