package com.vetsoft.auth.service;

import com.vetsoft.auth.dto.RegistroUsuarioRequestDto;
import com.vetsoft.auth.dto.UsuarioResponseDto;
import com.vetsoft.auth.exception.CorreoDuplicadoException;
import com.vetsoft.auth.model.Usuario;
import com.vetsoft.auth.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio de administración de usuarios internos (VET-RF-01).
 * Garantiza unicidad del correo, validación de rol interno y cifrado BCrypt.
 */
@Service
public class AdminUsuarioService {

    private static final Logger log = LoggerFactory.getLogger(AdminUsuarioService.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UsuarioResponseDto registrarUsuarioInterno(RegistroUsuarioRequestDto request) {
        String correoNormalizado = request.getCorreo().trim().toLowerCase();

        if (!request.getRol().esRolInterno()) {
            throw new IllegalArgumentException(
                    "Solo se permiten roles internos: Veterinario, Recepcionista o Administrador"
            );
        }

        if (usuarioRepository.existsByCorreoIgnoreCase(correoNormalizado)) {
            throw new CorreoDuplicadoException();
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombreCompleto(request.getNombreCompleto().trim());
        nuevoUsuario.setCorreo(correoNormalizado);
        // Cifrado BCrypt antes de persistir; la contraseña en texto plano nunca se almacena ni registra
        nuevoUsuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        nuevoUsuario.setRol(request.getRol());
        nuevoUsuario.setActivo(true);

        try {
            Usuario guardado = usuarioRepository.save(nuevoUsuario);
            log.info("Usuario interno registrado con correo={} y rol={}", guardado.getCorreo(), guardado.getRol());
            return UsuarioResponseDto.fromEntity(guardado);
        } catch (DataIntegrityViolationException ex) {
            throw new CorreoDuplicadoException();
        }
    }

    @Transactional(readOnly = true)
    public Page<UsuarioResponseDto> listarUsuariosPaginados(Pageable pageable) {
        return usuarioRepository.findAllByOrderByIdUsuarioDesc(pageable)
                .map(UsuarioResponseDto::fromEntity);
    }
}

