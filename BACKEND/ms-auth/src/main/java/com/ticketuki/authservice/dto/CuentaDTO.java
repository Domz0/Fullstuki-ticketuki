package com.ticketuki.authservice.dto;

import com.ticketuki.authservice.model.UsuarioAuth;
import com.ticketuki.authservice.model.Rol;

public record CuentaDTO(Long authId, String username, Rol rol, Long usuarioId, boolean activo) {
    public static CuentaDTO from(UsuarioAuth usuario) {
        return new CuentaDTO(usuario.getId_usuario_auth(), usuario.getUsername(), usuario.getRol(), usuario.getUsuarioId(), usuario.isActivo());
    }
}
