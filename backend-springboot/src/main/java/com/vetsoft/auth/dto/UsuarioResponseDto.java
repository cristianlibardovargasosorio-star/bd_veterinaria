package com.vetsoft.auth.dto;

import com.vetsoft.auth.model.Usuario;
import java.time.OffsetDateTime;

/**
 * DTO de salida para usuarios registrados (VET-RF-01).
 * Omite cualquier dato sensible o hash de contraseña.
 */
public class UsuarioResponseDto {

    private final Long idUsuario;
    private final String nombreCompleto;
    private final String correo;
    private final String rol;
    private final boolean activo;
    private final OffsetDateTime fechaCreacion;

    public UsuarioResponseDto(
            Long idUsuario,
            String nombreCompleto,
            String correo,
            String rol,
            boolean activo,
            OffsetDateTime fechaCreacion
    ) {
        this.idUsuario = idUsuario;
        this.nombreCompleto = nombreCompleto;
        this.correo = correo;
        this.rol = rol;
        this.activo = activo;
        this.fechaCreacion = fechaCreacion;
    }

    public static UsuarioResponseDto fromEntity(Usuario usuario) {
        return new UsuarioResponseDto(
                usuario.getIdUsuario(),
                usuario.getNombreCompleto(),
                usuario.getCorreo(),
                usuario.getRol().getEtiqueta(),
                usuario.isActivo(),
                usuario.getFechaCreacion()
        );
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public String getCorreo() {
        return correo;
    }

    public String getRol() {
        return rol;
    }

    public boolean isActivo() {
        return activo;
    }

    public OffsetDateTime getFechaCreacion() {
        return fechaCreacion;
    }
}
