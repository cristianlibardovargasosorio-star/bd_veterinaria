package com.vetsoft.auth.model;

/**
 * Enumeración de roles permitidos en el sistema según RF-01.
 */
public enum RolUsuario {
    ADMINISTRADOR("/admin/dashboard"),
    VETERINARIO("/veterinario/panel"),
    PROPIETARIO("/propietario/portal");

    private final String targetPanelUrl;

    RolUsuario(String targetPanelUrl) {
        this.targetPanelUrl = targetPanelUrl;
    }

    public String getTargetPanelUrl() {
        return targetPanelUrl;
    }
}

