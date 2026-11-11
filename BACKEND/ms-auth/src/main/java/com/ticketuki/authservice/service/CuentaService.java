package com.ticketuki.authservice.service;

import com.ticketuki.authservice.dto.*;
import com.ticketuki.authservice.model.*;
import com.ticketuki.authservice.repository.UsuarioAuthRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.Objects;

@Service
public class CuentaService {
    private final UsuarioAuthRepository repository;
    public CuentaService(UsuarioAuthRepository repository) { this.repository = repository; }

    private UsuarioAuth bloquear(Long id) {
        return repository.findForUpdate(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cuenta no encontrada"));
    }
    private void administrador(Long actor) {
        var usuario = repository.findById(actor).orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN));
        if (!usuario.isActivo() || usuario.getRol() != Rol.ADMIN)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Se requiere ADMIN");
    }

    @Transactional(readOnly = true)
    public Page<CuentaDTO> listar(Long actor, int pagina, int cantidad) {
        administrador(actor);
        return repository.findAll(PageRequest.of(Math.max(0, pagina), Math.max(1, Math.min(100, cantidad)),
            Sort.by("id_usuario_auth"))).map(CuentaDTO::from);
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "CUENTA", accion = "ACTUALIZAR", id = "authId")
    public CuentaDTO cambiarContrasena(Long actor, CambiarContrasenaDTO dto) {
        var usuario = bloquear(actor);
        if (!usuario.isActivo()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cuenta desactivada");
        if (!Objects.equals(usuario.getPassword(), dto.actual()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña actual no coincide");
        if (Objects.equals(dto.actual(), dto.nueva()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nueva contraseña debe ser distinta");
        usuario.setPassword(dto.nueva());
        usuario.setTokenVersion(usuario.getTokenVersion() + 1);
        return CuentaDTO.from(repository.saveAndFlush(usuario));
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "CUENTA", accion = "ACTUALIZAR", id = "authId")
    public CuentaDTO cambiarActivo(Long actor, Long id, boolean activo) {
        repository.bloquearAdministradores();
        administrador(actor);
        if (actor.equals(id) && !activo) throw new ResponseStatusException(HttpStatus.CONFLICT, "No puedes desactivar tu propia cuenta");
        var usuario = bloquear(id);
        if (activo && usuario.getRol() == Rol.CLIENTE && usuario.getUsuarioId() == null)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Primero debe completarse el registro del perfil");
        if (usuario.isActivo() != activo) {
            usuario.setActivo(activo);
            usuario.setTokenVersion(usuario.getTokenVersion() + 1);
        }
        return CuentaDTO.from(repository.saveAndFlush(usuario));
    }

    @Transactional
    @com.ticketuki.common.audit.Auditar(entidad = "CUENTA", accion = "ACTUALIZAR", id = "authId")
    public CuentaDTO cambiarRol(Long actor, Long id, Rol rol) {
        repository.bloquearAdministradores();
        administrador(actor);
        if (actor.equals(id) && rol != Rol.ADMIN)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No puedes quitarte tu propio acceso de administrador");
        var usuario = bloquear(id);
        if (usuario.getUsuarioId() == null)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La cuenta debe tener un perfil vinculado");
        if (usuario.getRol() != rol) {
            usuario.setRol(rol);
            usuario.setTokenVersion(usuario.getTokenVersion() + 1);
        }
        return CuentaDTO.from(repository.saveAndFlush(usuario));
    }
}
