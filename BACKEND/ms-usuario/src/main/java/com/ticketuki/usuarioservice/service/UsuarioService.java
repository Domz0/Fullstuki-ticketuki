package com.ticketuki.usuarioservice.service;

import com.ticketuki.usuarioservice.dto.DireccionDTO;
import com.ticketuki.usuarioservice.dto.UsuarioRequestDTO;
import com.ticketuki.usuarioservice.dto.UsuarioResponseDTO;
import com.ticketuki.usuarioservice.exception.UsuarioDuplicadoException;
import com.ticketuki.usuarioservice.exception.UsuarioNotFoundException;
import com.ticketuki.usuarioservice.model.DireccionUsuario;
import com.ticketuki.usuarioservice.model.Usuario;
import com.ticketuki.usuarioservice.repository.DireccionUsuarioRepository;
import com.ticketuki.usuarioservice.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final DireccionUsuarioRepository direccionRepository;

    private void validarDuplicados(UsuarioRequestDTO dto, Long id) {
        dto.setRun(dto.getRun());
        dto.setEmail(dto.getEmail());
        usuarioRepository.findByRun(dto.getRun())
                .filter(usuario -> !Objects.equals(usuario.getId_usuario(), id))
                .ifPresent(usuario -> { throw new UsuarioDuplicadoException("El RUN ya existe"); });
        usuarioRepository.findByEmailIgnoreCase(dto.getEmail())
                .filter(usuario -> !Objects.equals(usuario.getId_usuario(), id))
                .ifPresent(usuario -> { throw new UsuarioDuplicadoException("El email ya existe"); });
    }

    private UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        DireccionDTO direccionDTO = null;
        if (usuario.getDireccion() != null) {
            direccionDTO = new DireccionDTO(
                usuario.getDireccion().getCalle(),
                usuario.getDireccion().getRegion(),
                usuario.getDireccion().getComuna(),
                usuario.getDireccion().getNum_calle()
            );
        }
        return new UsuarioResponseDTO(
            usuario.getId_usuario(),
            usuario.getRun(),
            usuario.getP_nombre(),
            usuario.getS_nombre(),
            usuario.getA_materno(),
            usuario.getA_paterno(),
            usuario.getEmail(),
            direccionDTO
        );
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarUsuarios() {
        log.info("Mostrando todos los usuarios");
        return usuarioRepository.findAll()
            .stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerUsuarioPorId(Long id) {
        log.info("Buscando usuario por id: {}", id);
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Usuario no encontrado con ID: {}", id);
                    return new UsuarioNotFoundException("Usuario no encontrado con ID: " + id);
                });
        return toResponseDTO(usuario);
    }

    @Transactional
    public UsuarioResponseDTO crearUsuario(UsuarioRequestDTO usuarioDTO) {
        log.info("Creando nuevo usuario con run: {}", usuarioDTO.getRun());
        validarDuplicados(usuarioDTO, null);

        DireccionUsuario direccion = new DireccionUsuario(
            null,
            usuarioDTO.getDireccion().getCalle(),
            usuarioDTO.getDireccion().getRegion(),
            usuarioDTO.getDireccion().getComuna(),
            usuarioDTO.getDireccion().getNum_calle()
        );
        direccion = direccionRepository.save(direccion);

        Usuario usuario = new Usuario(
            null,
            usuarioDTO.getRun(),
            usuarioDTO.getP_nombre(),
            usuarioDTO.getS_nombre(),
            usuarioDTO.getA_materno(),
            usuarioDTO.getA_paterno(),
            usuarioDTO.getEmail(),
            direccion
        );

        Usuario usuarioGuardado = usuarioRepository.saveAndFlush(usuario);
        log.info("Usuario creado exitosamente con ID: {}", usuarioGuardado.getId_usuario());

        return toResponseDTO(usuarioGuardado);
    }

    @Transactional
    public UsuarioResponseDTO actualizarUsuario(Long id, UsuarioRequestDTO usuarioDTO) {
        log.info("Actualizando usuario con id: {}", id);
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Usuario no encontrado para actualizar: {}", id);
                    return new UsuarioNotFoundException("Usuario no encontrado con ID: " + id);
                });

        usuarioDTO.setRun(usuarioDTO.getRun());
        if (!usuario.getRun().equalsIgnoreCase(usuarioDTO.getRun()))
            throw new IllegalArgumentException("El RUN del perfil no se puede cambiar");
        validarDuplicados(usuarioDTO, id);
        usuario.setRun(usuarioDTO.getRun());
        usuario.setP_nombre(usuarioDTO.getP_nombre());
        usuario.setS_nombre(usuarioDTO.getS_nombre());
        usuario.setA_materno(usuarioDTO.getA_materno());
        usuario.setA_paterno(usuarioDTO.getA_paterno());
        usuario.setEmail(usuarioDTO.getEmail());

        if (usuarioDTO.getDireccion() != null) {
            if (usuario.getDireccion() == null) {
                usuario.setDireccion(new DireccionUsuario());
            }
            usuario.getDireccion().setCalle(usuarioDTO.getDireccion().getCalle());
            usuario.getDireccion().setRegion(usuarioDTO.getDireccion().getRegion());
            usuario.getDireccion().setComuna(usuarioDTO.getDireccion().getComuna());
            usuario.getDireccion().setNum_calle(usuarioDTO.getDireccion().getNum_calle());
        }

        Usuario usuarioActualizado = usuarioRepository.saveAndFlush(usuario);
        log.info("Usuario actualizado exitosamente: {}", id);
        return toResponseDTO(usuarioActualizado);
    }

    @Transactional
    public void eliminarUsuario(Long id) {
        log.info("Eliminando usuario con ID: {}", id);

        if (!usuarioRepository.existsById(id)) {
            log.warn("Usuario no encontrado para eliminar: {}", id);
            throw new UsuarioNotFoundException("Usuario no encontrado!");
        }

        usuarioRepository.deleteById(id);
        log.info("Usuario eliminado exitosamente: {}", id);
    }
}
