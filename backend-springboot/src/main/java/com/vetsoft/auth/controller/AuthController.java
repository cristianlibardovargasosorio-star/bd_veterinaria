package com.vetsoft.auth.controller;

import com.vetsoft.auth.dto.LoginRequestDto;
import com.vetsoft.auth.model.RolUsuario;
import com.vetsoft.auth.security.CustomAuthFailureHandler;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Controlador de Autenticación para RF-01 (/login).
 * Soporta tanto el flujo web estándar de Spring Security (formLogin en /login)
 * como peticiones JSON desde el cliente React (/api/auth/login).
 */
@Controller
public class AuthController {

    private final AuthenticationManager authenticationManager;

    public AuthController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    /**
     * Sirve la vista de inicio de sesión en GET /login.
     */
    @GetMapping("/login")
    public String mostrarPaginaLogin() {
        return "login";
    }

    /**
     * Endpoint para clientes SPA (React) que envían JSON a /api/auth/login.
     * Cumple con:
     * 1. Validación previa de formato de correo (@Valid + @Email).
     * 2. Autenticación contra PostgreSQL con BCrypt vía AuthenticationManager.
     * 3. Respuesta con URL de redirección según el ENUM RolUsuario.
     */
    @PostMapping("/api/auth/login")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> autenticarJson(
            @Valid @RequestBody LoginRequestDto loginRequest,
            BindingResult bindingResult
    ) {
        // Criterio 1: Si el formato del correo es inválido, se rechaza con HTTP 400
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "autenticado", false,
                    "mensaje", CustomAuthFailureHandler.INVALID_EMAIL_FORMAT_ERROR
            ));
        }

        try {
            // Criterio 2: Comparación de credenciales con BCrypt en PostgreSQL
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getCorreo().trim(),
                            loginRequest.getContrasena()
                    )
            );

            // Criterio 3: Determinar el panel de destino según el rol ENUM
            RolUsuario rolDetectado = determinarRol(authentication);

            return ResponseEntity.ok(Map.of(
                    "autenticado", true,
                    "rol", rolDetectado.name(),
                    "redirectUrl", rolDetectado.getTargetPanelUrl()
            ));

        } catch (AuthenticationException ex) {
            // Mensaje genérico sin revelar si el correo existe ni exponer la contraseña
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "autenticado", false,
                    "mensaje", CustomAuthFailureHandler.GENERIC_CREDENTIALS_ERROR
            ));
        }
    }

    private RolUsuario determinarRol(Authentication authentication) {
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String auth = authority.getAuthority();
            if ("ROLE_ADMINISTRADOR".equals(auth)) {
                return RolUsuario.ADMINISTRADOR;
            } else if ("ROLE_VETERINARIO".equals(auth)) {
                return RolUsuario.VETERINARIO;
            } else if ("ROLE_PROPIETARIO".equals(auth)) {
                return RolUsuario.PROPIETARIO;
            }
        }
        return RolUsuario.PROPIETARIO;
    }
}

