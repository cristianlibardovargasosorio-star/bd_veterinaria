package com.vetsoft.auth;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vetsoft.auth.controller.AdminUsuarioController;
import com.vetsoft.auth.model.RolUsuario;
import com.vetsoft.auth.model.Usuario;
import com.vetsoft.auth.repository.UsuarioRepository;
import com.vetsoft.auth.security.CustomAuthFailureHandler;
import com.vetsoft.auth.security.JwtAuthenticationFilter;
import com.vetsoft.auth.security.JwtService;
import com.vetsoft.auth.security.RoleBasedAuthSuccessHandler;
import com.vetsoft.auth.security.SecurityConfig;
import com.vetsoft.auth.service.AdminUsuarioService;
import com.vetsoft.auth.service.CustomUserDetailsService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Pruebas de integración para VET-RF-01: Registro de Usuarios Internos en /admin/usuarios.
 * Cubre:
 * 1. Registro exitoso (Veterinario, Recepcionista, Administrador) sin exponer contraseña.
 * 2. Correo duplicado -> HTTP 409 con mensaje exacto "Este correo ya está registrado".
 * 3. Contraseña menor a 6 caracteres -> HTTP 400 (validación backend).
 * 4. Correo con formato inválido -> HTTP 400 (validación backend).
 * 5. Verificación de almacenamiento cifrado con BCrypt.
 */
@WebMvcTest(AdminUsuarioController.class)
@Import({
    SecurityConfig.class,
    JwtService.class,
    JwtAuthenticationFilter.class,
    AdminUsuarioService.class,
    CustomUserDetailsService.class,
    RoleBasedAuthSuccessHandler.class,
    CustomAuthFailureHandler.class
})
class AdminUsuarioIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @Test
    @WithMockUser(username = "admin@vetsoft.com", roles = "ADMINISTRADOR")
    @DisplayName("VET-RF-01: Registro exitoso de Veterinario cifra contraseña con BCrypt y oculta clave en respuesta")
    void registroExitosoVeterinarioCifraContrasena() throws Exception {
        when(usuarioRepository.existsByCorreoIgnoreCase("laura.vet@vetsoft.com")).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario u = invocation.getArgument(0);
            u.setIdUsuario(10L);
            return u;
        });

        Map<String, Object> payload = Map.of(
                "nombreCompleto", "Dra. Laura Gómez",
                "correo", "Laura.Vet@vetsoft.com",
                "contrasena", "ClaveSegura123",
                "rol", "Veterinario"
        );

        mockMvc.perform(post("/admin/usuarios")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idUsuario").value(10))
                .andExpect(jsonPath("$.nombreCompleto").value("Dra. Laura Gómez"))
                .andExpect(jsonPath("$.correo").value("laura.vet@vetsoft.com"))
                .andExpect(jsonPath("$.rol").value("Veterinario"))
                .andExpect(jsonPath("$.contrasena").doesNotExist());

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        Usuario persistido = captor.getValue();

        assertNotEquals("ClaveSegura123", persistido.getContrasena(), "No debe guardarse en texto plano");
        assertTrue(persistido.getContrasena().startsWith("$2a$"), "Debe almacenarse como hash BCrypt");
        assertTrue(passwordEncoder.matches("ClaveSegura123", persistido.getContrasena()), "El hash BCrypt debe validar la clave");
        assertEquals(RolUsuario.VETERINARIO, persistido.getRol());
    }

    @Test
    @WithMockUser(username = "admin@vetsoft.com", roles = "ADMINISTRADOR")
    @DisplayName("VET-RF-01: Correo duplicado se rechaza con HTTP 409 y mensaje exacto")
    void correoDuplicadoRetornaMensajeExacto() throws Exception {
        when(usuarioRepository.existsByCorreoIgnoreCase("recepcion@vetsoft.com")).thenReturn(true);

        Map<String, Object> payload = Map.of(
                "nombreCompleto", "Ana Recepción",
                "correo", "recepcion@vetsoft.com",
                "contrasena", "Clave1234",
                "rol", "Recepcionista"
        );

        mockMvc.perform(post("/admin/usuarios")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensaje").value("Este correo ya está registrado"));

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @WithMockUser(username = "admin@vetsoft.com", roles = "ADMINISTRADOR")
    @DisplayName("VET-RF-01: Contraseña menor a 6 caracteres es rechazada por el backend")
    void contrasenaCortaEsRechazada() throws Exception {
        Map<String, Object> payload = Map.of(
                "nombreCompleto", "Carlos Ruiz",
                "correo", "carlos.ruiz@vetsoft.com",
                "contrasena", "12345",
                "rol", "Administrador"
        );

        mockMvc.perform(post("/admin/usuarios")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDACION_FALLIDA"));

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @WithMockUser(username = "admin@vetsoft.com", roles = "ADMINISTRADOR")
    @DisplayName("VET-RF-01: Correo con formato inválido es rechazado por el backend")
    void correoInvalidoEsRechazado() throws Exception {
        Map<String, Object> payload = Map.of(
                "nombreCompleto", "Sofía Pérez",
                "correo", "correo-sin-arroba",
                "contrasena", "ClaveValida99",
                "rol", "Recepcionista"
        );

        mockMvc.perform(post("/admin/usuarios")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDACION_FALLIDA"));

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @WithMockUser(username = "admin@vetsoft.com", roles = "ADMINISTRADOR")
    @DisplayName("Lazy Loading: Consulta paginada en GET /admin/usuarios evita cargar registros innecesarios")
    void listarUsuariosPaginadosRetornaPaginaAcotada() throws Exception {
        Usuario vet = new Usuario(1L, "Dra. Laura Gómez", "laura@vetsoft.com", "$2a$12$hash", RolUsuario.VETERINARIO, true);
        when(usuarioRepository.findAllByOrderByIdUsuarioDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(vet), PageRequest.of(0, 5), 1));

        mockMvc.perform(get("/admin/usuarios")
                        .param("page", "0")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].correo").value("laura@vetsoft.com"))
                .andExpect(jsonPath("$.size").value(5))
                .andExpect(jsonPath("$.totalElements").value(1));
    }
}

