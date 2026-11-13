package com.vetsoft.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO de petición de inicio de sesión con validación sintáctica de correo (Criterio 1).
 * Nunca expone la contraseña en su método toString().
 */
public class LoginRequestDto {

    @NotBlank(message = "El formato del correo electrónico no es válido.")
    @Email(
        regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
        message = "El formato del correo electrónico no es válido."
    )
    private String correo;

    @NotBlank(message = "La contraseña es requerida.")
    private String contrasena;

    public LoginRequestDto() {
    }

    public LoginRequestDto(String correo, String contrasena) {
        this.correo = correo;
        this.contrasena = contrasena;
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

    @Override
    public String toString() {
        return "LoginRequestDto{correo='" + correo + "', contrasena='[PROTECTED]'}";
    }
}
