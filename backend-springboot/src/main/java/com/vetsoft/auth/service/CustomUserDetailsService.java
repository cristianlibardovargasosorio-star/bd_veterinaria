package com.vetsoft.auth.service;

import com.vetsoft.auth.model.Usuario;
import com.vetsoft.auth.repository.UsuarioRepository;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio encargado de cargar al usuario desde PostgreSQL para que
 * DaoAuthenticationProvider de Spring Security compare el hash BCrypt.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Valida la sintaxis del correo antes de consultar la base de datos.
     */
    public boolean esFormatoCorreoValido(String correo) {
        return correo != null && EMAIL_PATTERN.matcher(correo.trim()).matches();
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        if (!esFormatoCorreoValido(correo)) {
            throw new BadCredentialsException("El formato del correo electrónico no es válido.");
        }

        // No revelamos si el correo existe o no en el mensaje de excepción (seguridad OWASP)
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correo.trim())
                .orElseThrow(() -> new UsernameNotFoundException("Credenciales inválidas"));

        return User.builder()
                .username(usuario.getCorreo())
                .password(usuario.getContrasena()) // Hash BCrypt almacenado en PostgreSQL
                .disabled(!usuario.isActivo())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name())))
                .build();
    }
}
