package com.vetsoft.auth;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.vetsoft.auth.controller.AuthController;
import com.vetsoft.auth.model.RolUsuario;
import com.vetsoft.auth.model.Usuario;
import com.vetsoft.auth.repository.UsuarioRepository;
import com.vetsoft.auth.security.CustomAuthFailureHandler;
import com.vetsoft.auth.security.JwtAuthenticationFilter;
import com.vetsoft.auth.security.JwtService;
import com.vetsoft.auth.security.RoleBasedAuthSuccessHandler;
import com.vetsoft.auth.security.SecurityConfig;
import com.vetsoft.auth.service.CustomUserDetailsService;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Suite de Pruebas de Integración para RF-01: Autenticación de Usuarios por Correo y Contraseña.
 * Cubre todos los escenarios exigidos:
 * 1. Inicio de sesión exitoso para ADMINISTRADOR -> redirige a /admin/dashboard
 * 2. Inicio de sesión exitoso para VETERINARIO   -> redirige a /veterinario/panel
 * 3. Inicio de sesión exitoso para PROPIETARIO   -> redirige a /propietario/portal
 * 4. Contraseña incorrecta -> rechaza con mensaje genérico y sin exponer clave
 * 5. Correo con formato inválido -> rechaza por validación de formato antes de autenticar
 * 6. Usuario inexistente -> rechaza con el mismo mensaje genérico sin revelar inexistencia
 */
@WebMvcTest(AuthController.class)
@Import({
    SecurityConfig.class,
    JwtService.class,
    JwtAuthenticationFilter.class,
    CustomUserDetailsService.class,
    RoleBasedAuthSuccessHandler.class,
    CustomAuthFailureHandler.class
})
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private UsuarioRepository usuarioRepository;

    private static final String CLAVE_VALIDA = "VetSoft2026*";
    private String hashValido;

    @BeforeEach
    void setUp() {
        hashValido = passwordEncoder.encode(CLAVE_VALIDA);

        Usuario admin = new Usuario(1L, "admin@vetsoft.com", hashValido, RolUsuario.ADMINISTRADOR, true);
        Usuario vet = new Usuario(2L, "camilo.vet@vetsoft.com", hashValido, RolUsuario.VETERINARIO, true);
        Usuario prop = new Usuario(3L, "carlos.mendoza@email.com", hashValido, RolUsuario.PROPIETARIO, true);
        Usuario inactivo = new Usuario(4L, "inactivo@vetsoft.com", hashValido, RolUsuario.VETERINARIO, false);

        when(usuarioRepository.findByCorreoIgnoreCase("admin@vetsoft.com"))
                .thenReturn(Optional.of(admin));
        when(usuarioRepository.findByCorreoIgnoreCase("camilo.vet@vetsoft.com"))
                .thenReturn(Optional.of(vet));
        when(usuarioRepository.findByCorreoIgnoreCase("carlos.mendoza@email.com"))
                .thenReturn(Optional.of(prop));
        when(usuarioRepository.findByCorreoIgnoreCase("inactivo@vetsoft.com"))
                .thenReturn(Optional.of(inactivo));
        when(usuarioRepository.findByCorreoIgnoreCase("noexiste@vetsoft.com"))
                .thenReturn(Optional.empty());
    }

    @Test
    @DisplayName("RF-01: Login exitoso de ADMINISTRADOR redirige a /admin/dashboard")
    void loginExitosoAdministradorRedirigeAPanelAdmin() throws Exception {
        mockMvc.perform(post("/login")
                        .param("correo", "admin@vetsoft.com")
                        .param("contrasena", CLAVE_VALIDA)
                        .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/dashboard"));
    }

    @Test
    @DisplayName("RF-01: Login exitoso de VETERINARIO redirige a /veterinario/panel")
    void loginExitosoVeterinarioRedirigeAPanelVeterinario() throws Exception {
        mockMvc.perform(post("/login")
                        .param("correo", "camilo.vet@vetsoft.com")
                        .param("contrasena", CLAVE_VALIDA)
                        .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/veterinario/panel"));
    }

    @Test
    @DisplayName("RF-01: Login exitoso de PROPIETARIO redirige a /propietario/portal")
    void loginExitosoPropietarioRedirigeAPortalPropietario() throws Exception {
        mockMvc.perform(post("/login")
                        .param("correo", "carlos.mendoza@email.com")
                        .param("contrasena", CLAVE_VALIDA)
                        .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/propietario/portal"));
    }

    @Test
    @DisplayName("RF-01: Contraseña incorrecta devuelve mensaje genérico y redirige a /login?error=credenciales")
    void loginConContrasenaIncorrectaFallaConMensajeGenerico() throws Exception {
        mockMvc.perform(post("/login")
                        .param("correo", "admin@vetsoft.com")
                        .param("contrasena", "ClaveIncorrecta999")
                        .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?error=credenciales"))
                .andExpect(request().sessionAttribute(
                        "AUTH_ERROR_MSG",
                        CustomAuthFailureHandler.GENERIC_CREDENTIALS_ERROR
                ));
    }

    @Test
    @DisplayName("RF-01: Usuario inexistente devuelve exactamente el mismo mensaje genérico sin revelar si el correo existe")
    void loginConUsuarioInexistenteFallaSinRevelarExistencia() throws Exception {
        mockMvc.perform(post("/login")
                        .param("correo", "noexiste@vetsoft.com")
                        .param("contrasena", CLAVE_VALIDA)
                        .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?error=credenciales"))
                .andExpect(request().sessionAttribute(
                        "AUTH_ERROR_MSG",
                        CustomAuthFailureHandler.GENERIC_CREDENTIALS_ERROR
                ));
    }

    @Test
    @DisplayName("RF-01: Correo con formato inválido es rechazado por validación de formato")
    void loginConFormatoCorreoInvalidoEsRechazado() throws Exception {
        mockMvc.perform(post("/login")
                        .param("correo", "correo-sin-arroba-ni-dominio")
                        .param("contrasena", CLAVE_VALIDA)
                        .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?error=formato_correo"))
                .andExpect(request().sessionAttribute(
                        "AUTH_ERROR_MSG",
                        CustomAuthFailureHandler.INVALID_EMAIL_FORMAT_ERROR
                ));
    }

    @Test
    @DisplayName("RF-01 API JSON: Validación previa rechaza formato de correo inválido con HTTP 400")
    void apiJsonRechazaCorreoConFormatoInvalido() throws Exception {
        String payload = """
                {
                  "correo": "formato_invalido@",
                  "contrasena": "VetSoft2026*"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload)
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.autenticado").value(false));
    }

    @Test
    @DisplayName("VET-RF-02: Credenciales válidas emiten token JWT firmado y URL de redirección por rol")
    void apiJsonCredencialesValidasEmitenJwt() throws Exception {
        String payload = """
                {
                  "correo": "admin@vetsoft.com",
                  "contrasena": "VetSoft2026*"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.autenticado").value(true))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tipoToken").value("Bearer"))
                .andExpect(jsonPath("$.rol").value("ADMINISTRADOR"))
                .andExpect(jsonPath("$.redirectUrl").value("/admin/dashboard"));
    }

    @Test
    @DisplayName("VET-RF-02: Credenciales inválidas devuelven exactamente 'Correo o contraseña incorrectos'")
    void apiJsonCredencialesInvalidasRetornanMensajeExacto() throws Exception {
        String payload = """
                {
                  "correo": "admin@vetsoft.com",
                  "contrasena": "ClaveIncorrecta999"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload)
                        .with(csrf()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.autenticado").value(false))
                .andExpect(jsonPath("$.mensaje").value("Correo o contraseña incorrectos"));
    }

    @Test
    @DisplayName("VET-RF-02: Cuenta inactiva es rechazada con exactamente 'Correo o contraseña incorrectos'")
    void apiJsonCuentaInactivaRetornaMensajeExacto() throws Exception {
        String payload = """
                {
                  "correo": "inactivo@vetsoft.com",
                  "contrasena": "VetSoft2026*"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload)
                        .with(csrf()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.autenticado").value(false))
                .andExpect(jsonPath("$.mensaje").value("Correo o contraseña incorrectos"));
    }

    @Test
    @DisplayName("VET-RF-02: Campos vacíos son rechazados en el backend con HTTP 400")
    void apiJsonCamposVaciosRechazados() throws Exception {
        String payload = """
                {
                  "correo": "",
                  "contrasena": ""
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload)
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.autenticado").value(false));
    }
}

