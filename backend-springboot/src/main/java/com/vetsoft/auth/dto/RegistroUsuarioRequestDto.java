package com.vetsoft.auth.dto;

import com.vetsoft.auth.model.RolUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO de entrada para el registro de usuarios internos (VET-RF-01).
 * Aplica validación en backend de formato de correo y longitud mínima de contraseña (6 caracteres).
 */
public class RegistroUsuarioRequestDto {

    @NotBlank(message = "El nombre completo es obligatorio")
    @Size(max = 150, message = "El nombre completo no puede superar 150 caracteres")
    private String nombreCompleto;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(
        regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
        message = "El formato del correo electrónico no es válido"
    )
    private String correo;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 100, message = "La contraseña debe tener mínimo 6 caracteres")
    private String contrasena;

    @NotNull(message = "El rol es obligatorio")
    private RolUsuario rol;

    public RegistroUsuarioRequestDto() {
    }

    public RegistroUsuarioRequestDto(String nombreCompleto, String correo, String contrasena, RolUsuario rol) {
        this.nombreCompleto = nombreCompleto;
        this.correo = correo;
        this.contrasena = contrasena;
        this.rol = rol;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    public RolUsuario getRol() {
        return rol;
    }

    public void setRol(RolUsuario rol) {
        this.rol = rol;
    }

    /**
     * Nunca expone la contraseña en texto plano en logs o depuración.
     */
    @Override
    public String toString() {
        return "RegistroUsuarioRequestDto{" +
                "nombreCompleto='" + nombreCompleto + '\'' +
                ", correo='" + correo + '\'' +
                ", rol=" + rol +
                '}';
    }
}

