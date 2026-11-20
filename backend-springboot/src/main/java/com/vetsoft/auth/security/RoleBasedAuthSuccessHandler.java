package com.vetsoft.auth.security;

import com.vetsoft.auth.model.RolUsuario;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collection;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

/**
 * Manejador de éxito de autenticación para RF-01 (Criterio de Aceptación 3).
 * Redirige automáticamente al panel correspondiente según el ENUM RolUsuario:
 * - ADMINISTRADOR -> /admin/dashboard
 * - VETERINARIO   -> /veterinario/panel
 * - PROPIETARIO   -> /propietario/portal
 */
@Component
public class RoleBasedAuthSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String targetUrl = "/login?error";

        for (GrantedAuthority authority : authorities) {
            String role = authority.getAuthority();
            if ("ROLE_ADMINISTRADOR".equals(role)) {
                targetUrl = RolUsuario.ADMINISTRADOR.getTargetPanelUrl();
                break;
            } else if ("ROLE_VETERINARIO".equals(role)) {
                targetUrl = RolUsuario.VETERINARIO.getTargetPanelUrl();
                break;
            } else if ("ROLE_RECEPCIONISTA".equals(role)) {
                targetUrl = RolUsuario.RECEPCIONISTA.getTargetPanelUrl();
                break;
            } else if ("ROLE_PROPIETARIO".equals(role)) {
                targetUrl = RolUsuario.PROPIETARIO.getTargetPanelUrl();
                break;
            }
        }

        response.sendRedirect(request.getContextPath() + targetUrl);
    }
}

