package com.vetsoft.auth;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vetsoft.auth.controller.AuthController;
import com.vetsoft.auth.model.RolUsuario;
import com.vetsoft.auth.model.Usuario;
import com.vetsoft.auth.repository.UsuarioRepository;
import com.vetsoft.auth.security.*;
import com.vetsoft.auth.service.CustomUserDetailsService;
import java.util.Optional;
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
 * Pruebas específicas de cumplimiento VET-RNF-02 (BCrypt fuerza 12, RBAC 403, redirección por rol y no exposición de hashes).
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
class RbacSecurityRnf02Test {

    @Autowired private MockMvc mockMvc;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private UsuarioRepository usuarioRepository;

    @Test
    @DisplayName("VET-RNF-02: BCrypt usa factor de costo 12 y Usuario oculta el hash con @JsonIgnore")
    void bcryptFuerza12YUsuarioNoExponeHashEnJson() throws Exception {
        String hash = passwordEncoder.encode("VetSoft2026*");
        assertTrue(hash.startsWith("$2a$12$") || hash.startsWith("$2b$12$"), "Debe usar BCrypt fuerza 12");

        Usuario usuario = new Usuario(1L, "Admin", "admin@vetsoft.com", hash, RolUsuario.ADMINISTRADOR, true);
        String json = objectMapper.writeValueAsString(usuario);
        assertTrue(!json.contains(hash) && !json.contains("contrasena"), "El hash jamás debe serializarse en JSON");
    }

    @Test
    @DisplayName("VET-RNF-02: Usuario sin el rol adecuado recibe HTTP 403 en rutas protegidas")
    void usuarioSinRolAdecuadoRecibe403() throws Exception {
        mockMvc.perform(get("/admin/usuarios").with(user("prop@vetsoft.com").roles("PROPIETARIO")))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/veterinario/consultas").with(user("prop@vetsoft.com").roles("PROPIETARIO")))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/propietario/mascotas").with(user("vet@vetsoft.com").roles("VETERINARIO")))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("VET-RNF-02: Login JSON redirige según rol y no filtra hashes de contraseña")
    void loginJsonRedirigePorRolYSinHash() throws Exception {
        String hash = passwordEncoder.encode("VetSoft2026*");
        when(usuarioRepository.findByCorreoIgnoreCase("camilo.vet@vetsoft.com"))
                .thenReturn(Optional.of(new Usuario(2L, "Dr. Camilo", "camilo.vet@vetsoft.com", hash, RolUsuario.VETERINARIO, true)));

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correo\":\"camilo.vet@vetsoft.com\",\"contrasena\":\"VetSoft2026*\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.redirectUrl").value("/veterinario/panel"))
                .andExpect(content().string(not(containsString("$2a$"))));
    }
}
