package com.ticketuki.usuarioservice.controller;

import com.ticketuki.usuarioservice.dto.UsuarioRequestDTO;
import com.ticketuki.usuarioservice.dto.UsuarioResponseDTO;
import com.ticketuki.usuarioservice.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
@Slf4j
public class UsuarioController {
    private final UsuarioService usuarioService;

    @GetMapping("/destinatario")
    public ResponseEntity<UsuarioService.Destinatario> buscarDestinatario(@RequestParam String correo) {
        return ResponseEntity.ok(usuarioService.buscarDestinatario(correo));
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listarUsuarios() {
        log.info("GET /api/usuarios - Listando usuarios");
        return ResponseEntity.ok(usuarioService.listarUsuarios());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> obtenerUsuarioPorId(@PathVariable Long id) {
        log.info("GET /api/usuarios/{} - Obteniendo usuario", id);
        return ResponseEntity.ok(usuarioService.obtenerUsuarioPorId(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> crearUsuario(@Valid @RequestBody UsuarioRequestDTO usuarioDTO) {
        log.info("POST /api/usuarios - Creando nuevo usuario");
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.crearUsuario(usuarioDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> actualizarUsuario(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioRequestDTO usuarioDTO) {
        log.info("PUT /usuarios/{} - Actualizando usuario", id);
        return ResponseEntity.ok(usuarioService.actualizarUsuario(id, usuarioDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        log.info("DELETE /api/usuarios/{} - Eliminando usuario", id);
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}
