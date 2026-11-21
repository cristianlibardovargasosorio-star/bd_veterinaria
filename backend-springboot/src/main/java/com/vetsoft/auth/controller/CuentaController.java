package com.vetsoft.auth.controller;

import com.vetsoft.auth.model.RolUsuario;
import com.vetsoft.auth.model.Usuario;
import com.vetsoft.auth.repository.UsuarioRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.Locale;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class CuentaController {
    private final UsuarioRepository usuarios;
    private final PasswordEncoder passwordEncoder;

    public CuentaController(UsuarioRepository usuarios, PasswordEncoder passwordEncoder) {
        this.usuarios = usuarios;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/api/auth/registro")
    public ResponseEntity<Map<String, String>> registrar(
            @Valid @RequestBody Registro solicitud, BindingResult validacion) {
        if (validacion.hasErrors()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "mensaje", "Revisa tu nombre, correo y contraseña (mínimo 8 caracteres)."));
        }
        if (solicitud.contrasena().getBytes(StandardCharsets.UTF_8).length > 72) {
            return ResponseEntity.badRequest().body(Map.of(
                    "mensaje", "La contraseña es demasiado larga para guardarla de forma segura."));
        }

        String correo = solicitud.correo().toLowerCase(Locale.ROOT);
        String correoOcupado = "Ese correo ya está registrado.";
        if (usuarios.existsByCorreoIgnoreCase(correo)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", correoOcupado));
        }
        try {
            usuarios.saveAndFlush(new Usuario(null, solicitud.nombreCompleto().trim(), correo,
                    passwordEncoder.encode(solicitud.contrasena()), RolUsuario.PROPIETARIO, true));
        } catch (DataIntegrityViolationException ex) {
            if (!usuarios.existsByCorreoIgnoreCase(correo)) {
                throw ex;
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", correoOcupado));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensaje", "Cuenta creada. Ya puedes iniciar sesión."));
    }

    @GetMapping("/api/auth/cuenta")
    public Cuenta cuenta(Principal principal) {
        Usuario usuario = usuarios.findByCorreoIgnoreCase(principal.getName())
                .filter(Usuario::isActivo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return new Cuenta(usuario.getIdUsuario(), usuario.getNombreCompleto(), usuario.getCorreo(),
                usuario.getRol(), usuario.getFechaCreacion().toString());
    }

    public record Registro(
            @NotBlank @Size(max = 150) String nombreCompleto,
            @NotBlank @Size(max = 150) @Email(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$") String correo,
            @NotBlank @Size(min = 8, max = 72) String contrasena) {}

    public record Cuenta(long idUsuario, String nombreCompleto, String correo, RolUsuario rol, String fechaCreacion) {}
}
