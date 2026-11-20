-- =============================================================================
-- ESQUEMA POSTGRESQL PARA MÓDULO 1: AUTENTICACIÓN Y ACCESO (RF-01)
-- =============================================================================

-- 1. Tipo ENUM en PostgreSQL (Opcional si se mapea como VARCHAR con @Enumerated(EnumType.STRING),
--    o mediante CHECK constraint para máxima compatibilidad con JPA/Hibernate)
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario BIGSERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL DEFAULT '',
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(60) NOT NULL, -- Hash BCrypt ($2a$12$...) nunca texto plano
    rol VARCHAR(25) NOT NULL CHECK (rol IN ('ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA', 'PROPIETARIO')),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índice B-Tree para optimizar la búsqueda de usuario por correo en el login
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_correo_lower ON usuarios (LOWER(correo));

-- Tabla de auditoría de accesos relacionada con FetchType.LAZY
CREATE TABLE IF NOT EXISTS auditoria_accesos (
    id_auditoria BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    evento VARCHAR(80) NOT NULL,
    fecha_evento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_auditoria_accesos_usuario ON auditoria_accesos (id_usuario);

-- =============================================================================
-- DATOS SEMILLA DE PRUEBA (Contraseñas cifradas con BCrypt strength 12)
-- Contraseña de prueba para los tres roles: "vetsoft123"
-- =============================================================================
INSERT INTO usuarios (nombre_completo, correo, contrasena, rol, activo)
VALUES
    ('Administrador Principal', 'admin@vetsoft.com', '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW', 'ADMINISTRADOR', TRUE),
    ('Dr. Camilo Andrés', 'camilo.vet@vetsoft.com', '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW', 'VETERINARIO', TRUE),
    ('Carlos Mendoza', 'carlos.mendoza@vetsoft.com', '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW', 'PROPIETARIO', TRUE)
ON CONFLICT (correo) DO NOTHING;

