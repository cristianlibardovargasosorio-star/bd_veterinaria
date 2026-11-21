package com.vetsoft.auth.security;

import com.vetsoft.auth.service.CustomUserDetailsService;
import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * Configuración central de Spring Security para el Módulo 1: Autenticación y Acceso (RF-01).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final RoleBasedAuthSuccessHandler successHandler;
    private final CustomAuthFailureHandler failureHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            CustomUserDetailsService userDetailsService,
            RoleBasedAuthSuccessHandler successHandler,
            CustomAuthFailureHandler failureHandler,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.userDetailsService = userDetailsService;
        this.successHandler = successHandler;
        this.failureHandler = failureHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * Codificador criptográfico BCrypt (factor de costo 12).
     * Garantiza que nunca se almacenen ni comparen contraseñas en texto plano.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * Proveedor de autenticación respaldado por PostgreSQL y BCrypt.
     * hideUserNotFoundExceptions = true (por defecto) asegura que no se filtre
     * si un correo electrónico existe o no en la base de datos.
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        authProvider.setHideUserNotFoundExceptions(true);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * Reglas de autorización por rol y configuración del endpoint /login.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .exceptionHandling(ex -> ex.defaultAuthenticationEntryPointFor(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED), new AntPathRequestMatcher("/api/**")))
            .csrf(csrf -> csrf.ignoringRequestMatchers("/api/auth/login", "/api/auth/registro", "/api/admin/usuarios/**", "/api/pacientes/**", "/api/inventario/**", "/api/facturacion/**"))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin())
                .contentTypeOptions(Customizer.withDefaults())
            )
            .authorizeHttpRequests(auth -> auth
                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                .requestMatchers("/actuator/health", "/login", "/api/auth/login", "/api/auth/registro", "/api/auth/logout", "/css/**", "/js/**", "/images/**").permitAll()
                .requestMatchers("/admin/**", "/api/admin/**").hasRole("ADMINISTRADOR")
                .requestMatchers("/api/pacientes/mis-mascotas").hasRole("PROPIETARIO")
                .requestMatchers("/api/pacientes/citas", "/api/pacientes/citas/*").hasAnyRole("ADMINISTRADOR", "VETERINARIO", "RECEPCIONISTA", "PROPIETARIO")
                .requestMatchers("/api/pacientes/consultas", "/api/pacientes/vacunas", "/api/pacientes/fichas/**").hasAnyRole("ADMINISTRADOR", "VETERINARIO")
                .requestMatchers("/api/pacientes/**").hasAnyRole("ADMINISTRADOR", "VETERINARIO", "RECEPCIONISTA")
                .requestMatchers("/api/inventario/**").hasAnyRole("ADMINISTRADOR", "VETERINARIO", "RECEPCIONISTA")
                .requestMatchers("/api/facturacion/**").hasAnyRole("ADMINISTRADOR", "RECEPCIONISTA")
                .requestMatchers("/api/auditoria").hasAnyRole("ADMINISTRADOR", "RECEPCIONISTA")
                .requestMatchers("/erp/**").hasAnyRole("ADMINISTRADOR", "VETERINARIO", "RECEPCIONISTA")
                .requestMatchers("/veterinario/**", "/api/clinica/**").hasAnyRole("ADMINISTRADOR", "VETERINARIO")
                .requestMatchers("/recepcion/**").hasAnyRole("ADMINISTRADOR", "RECEPCIONISTA")
                .requestMatchers("/citas/**", "/carne-vacunacion/**").hasAnyRole("ADMINISTRADOR", "VETERINARIO", "RECEPCIONISTA", "PROPIETARIO")
                .requestMatchers("/propietario/**", "/api/propietario/**").hasAnyRole("ADMINISTRADOR", "PROPIETARIO")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .usernameParameter("correo")
                .passwordParameter("contrasena")
                .successHandler(successHandler)
                .failureHandler(failureHandler)
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            );

        return http.build();
    }
}

