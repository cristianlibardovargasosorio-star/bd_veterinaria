-- =============================================================================
-- ESQUEMA POSTGRESQL PARA MÓDULO 1: AUTENTICACIÓN Y ACCESO (RF-01)
-- =============================================================================

-- 1. Tipo ENUM en PostgreSQL (Opcional si se mapea como VARCHAR con @Enumerated(EnumType.STRING),
--    o mediante CHECK constraint para máxima compatibilidad con JPA/Hibernate)
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario BIGSERIAL PRIMARY KEY,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(60) NOT NULL, -- Hash BCrypt ($2a$12$...) nunca texto plano
    rol VARCHAR(25) NOT NULL CHECK (rol IN ('ADMINISTRADOR', 'VETERINARIO', 'PROPIETARIO')),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índice B-Tree para optimizar la búsqueda de usuario por correo en el login
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_correo_lower ON usuarios (LOWER(correo));

-- =============================================================================
-- DATOS SEMILLA DE PRUEBA (Contraseñas cifradas con BCrypt strength 12)
-- Contraseña original para todos los usuarios de prueba: "VetSoft2026*"
-- =============================================================================
INSERT INTO usuarios (correo, contrasena, rol, activo)
VALUES
    ('admin@vetsoft.com', '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW', 'ADMINISTRADOR', TRUE),
    ('camilo.vet@vetsoft.com', '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW', 'VETERINARIO', TRUE),
    ('carlos.mendoza@email.com', '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW', 'PROPIETARIO', TRUE)
ON CONFLICT (correo) DO NOTHING;

