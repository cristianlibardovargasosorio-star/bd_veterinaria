package com.vetsoft.auth.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.text.Normalizer;
import java.util.Locale;

/**
 * Enumeración de roles del sistema VetSoft (RF-01 y VET-RF-01).
 * Soporta los valores internos Veterinario, Recepcionista y Administrador,
 * además de Propietario para el portal de tutores.
 */
public enum RolUsuario {
    ADMINISTRADOR("/admin/dashboard", "Administrador"),
    VETERINARIO("/veterinario/panel", "Veterinario"),
    RECEPCIONISTA("/recepcion/agenda", "Recepcionista"),
    PROPIETARIO("/propietario/portal", "Propietario");

    private final String targetPanelUrl;
    private final String etiqueta;

    RolUsuario(String targetPanelUrl, String etiqueta) {
        this.targetPanelUrl = targetPanelUrl;
        this.etiqueta = etiqueta;
    }

    public String getTargetPanelUrl() {
        return targetPanelUrl;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    public boolean esRolInterno() {
        return this == VETERINARIO || this == RECEPCIONISTA || this == ADMINISTRADOR;
    }

    @JsonCreator
    public static RolUsuario fromValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = Normalizer.normalize(value.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase(Locale.ROOT);
        for (RolUsuario rol : values()) {
            if (rol.name().equals(normalized)
                    || rol.etiqueta.toUpperCase(Locale.ROOT).equals(normalized)) {
                return rol;
            }
        }
        throw new IllegalArgumentException("Rol no válido: " + value);
    }
}
