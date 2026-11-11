package com.ticketuki.authservice.controller;

import com.ticketuki.authservice.dto.*;
import com.ticketuki.authservice.model.Rol;
import com.ticketuki.authservice.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/auth")
public class CuentaController {
    private final CuentaService cuentas;
    private final SesionService sesiones;
    public CuentaController(CuentaService cuentas, SesionService sesiones) {
        this.cuentas = cuentas;
        this.sesiones = sesiones;
    }
    public record ActivoDTO(@NotNull Boolean activo) {}
    public record RolDTO(@NotNull Rol rol) {}

    @GetMapping("/me")
    public CuentaDTO actual(@RequestHeader("Authorization") String token) {
        return CuentaDTO.from(sesiones.autenticar(token));
    }
    @GetMapping("/cuentas")
    public Page<CuentaDTO> listar(@RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int pagina, @RequestParam(defaultValue = "20") int cantidad) {
        return cuentas.listar(sesiones.autenticar(token).getId_usuario_auth(), pagina, cantidad);
    }
    @PatchMapping("/contrasena")
    public CuentaDTO contrasena(@RequestHeader("Authorization") String token, @Valid @RequestBody CambiarContrasenaDTO dto) {
        return cuentas.cambiarContrasena(sesiones.autenticar(token).getId_usuario_auth(), dto);
    }
    @PatchMapping("/cuentas/{id}/activo")
    public CuentaDTO activo(@RequestHeader("Authorization") String token, @PathVariable Long id, @Valid @RequestBody ActivoDTO dto) {
        return cuentas.cambiarActivo(sesiones.autenticar(token).getId_usuario_auth(), id, dto.activo());
    }
    @PatchMapping("/cuentas/{id}/rol")
    public CuentaDTO rol(@RequestHeader("Authorization") String token, @PathVariable Long id, @Valid @RequestBody RolDTO dto) {
        return cuentas.cambiarRol(sesiones.autenticar(token).getId_usuario_auth(), id, dto.rol());
    }
}
