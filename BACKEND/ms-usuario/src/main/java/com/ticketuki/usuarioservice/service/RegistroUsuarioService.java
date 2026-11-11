package com.ticketuki.usuarioservice.service;

import com.ticketuki.usuarioservice.dto.*;
import com.ticketuki.usuarioservice.repository.RegistroUsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistroUsuarioService {
    private final RegistroUsuarioRepository repository;
    private final UsuarioService usuarios;

    @Transactional
    public UsuarioResponseDTO registrar(String registroId, UsuarioRequestDTO dto) {
        repository.asegurarRegistro(registroId);
        var registro = repository.bloquear(registroId).orElseThrow();
        if (registro.getUsuarioId() != null) return usuarios.obtenerUsuarioPorId(registro.getUsuarioId());
        var usuario = usuarios.crearUsuario(dto);
        registro.setUsuarioId(usuario.getId_usuario());
        repository.save(registro);
        return usuario;
    }
}
