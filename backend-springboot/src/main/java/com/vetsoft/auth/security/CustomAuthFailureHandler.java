package com.vetsoft.auth.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.regex.Pattern;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

/**
 * Manejador de fallos de autenticación para RF-01.
 * Garantiza dos reglas de negocio y seguridad:
 * 1. Si el formato del correo es inválido, informa el error de validación de formato.
 * 2. Si el correo tiene formato válido pero el usuario no existe o la contraseña no coincide,
 *    devuelve un mensaje genérico sin revelar si el correo está registrado en PostgreSQL
 *    y sin registrar ni exponer jamás la contraseña ingresada.
 */
@Component
public class CustomAuthFailureHandler implements AuthenticationFailureHandler {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    public static final String GENERIC_CREDENTIALS_ERROR =
            "Correo o contraseña incorrectos";
    public static final String INVALID_EMAIL_FORMAT_ERROR =
            "El formato del correo electrónico no es válido.";

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {

        String correo = request.getParameter("correo");

        if (correo == null || !EMAIL_PATTERN.matcher(correo.trim()).matches()) {
            request.getSession().setAttribute("AUTH_ERROR_MSG", INVALID_EMAIL_FORMAT_ERROR);
            response.sendRedirect(request.getContextPath() + "/login?error=formato_correo");
            return;
        }

        // Mensaje genérico: protege contra enumeración de usuarios
        request.getSession().setAttribute("AUTH_ERROR_MSG", GENERIC_CREDENTIALS_ERROR);
        response.sendRedirect(request.getContextPath() + "/login?error=credenciales");
    }
}

