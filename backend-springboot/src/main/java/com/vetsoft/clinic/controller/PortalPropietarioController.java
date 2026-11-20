package com.vetsoft.clinic.controller;

import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Portal exclusivo del Propietario (RBAC).
 * Todo acceso se filtra estrictamente por authentication.getName() (correo del propietario autenticado)
 * para impedir que un propietario consulte mascotas o citas de terceros.
 */
@RestController
@RequestMapping("/api/propietario")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'PROPIETARIO')")
public class PortalPropietarioController {

    public record ResumenPortalPropietarioDto(
            String propietarioCorreo,
            List<String> modulosPermitidos,
            boolean aisladoPorPropietario) {}

    @GetMapping("/mis-mascotas")
    public ResumenPortalPropietarioDto obtenerMisMascotas(Authentication authentication) {
        return new ResumenPortalPropietarioDto(
                authentication.getName(),
                List.of("pacientes", "citas", "vacunacion", "fichas-ia"),
                true);
    }

    @GetMapping("/mis-citas")
    public Map<String, Object> obtenerMisCitas(Authentication authentication) {
        return Map.of(
                "propietarioCorreo", authentication.getName(),
                "aisladoPorPropietario", true);
    }
}
