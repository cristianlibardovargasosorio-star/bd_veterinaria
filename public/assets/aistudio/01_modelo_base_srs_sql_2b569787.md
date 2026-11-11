-- =============================================================================
-- SISTEMA DE GESTIÓN VETERINARIA (VETSOFT) - MÓDULO BASE Y ESQUEMA SRS
-- Motor: PostgreSQL 15+ / MySQL 8.0+ Compatible
-- Script 01: Usuarios, Roles, Clientes, Mascotas, Citas, Consultas y Módulo IA
-- =============================================================================

-- 1. TABLA DE USUARIOS Y ROLES (RF01)
CREATE TABLE roles (
    id_rol INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (nombre) VALUES ('ADMINISTRADOR'), ('VETERINARIO'), ('RECEPCIONISTA'), ('PROPIETARIO');

CREATE TABLE usuarios (
    id_usuario BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL, -- BCrypt Hash (RNF03)
    rol_id INT NOT NULL,
    estado ENUM('ACTIVO', 'INACTIVO', 'BLOQUEADO') NOT NULL DEFAULT 'ACTIVO',
    intentos_fallidos INT DEFAULT 0,
    otp_code VARCHAR(6) NULL,
    otp_expiracion DATETIME NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id_rol)
);

-- 2. TABLA DE PROPIETARIOS (RF06)
CREATE TABLE propietarios (
    id_propietario BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT UNSIGNED NULL UNIQUE,
    cedula_documento VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

-- 3. TABLA DE VETERINARIOS
CREATE TABLE veterinarios (
    id_veterinario BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT UNSIGNED NOT NULL UNIQUE,
    tarjeta_profesional VARCHAR(50) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100) DEFAULT 'General',
    telefono VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- 4. TABLA DE MASCOTAS (RF05)
CREATE TABLE mascotas (
    id_mascota BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_propietario BIGINT UNSIGNED NOT NULL,
    codigo_expediente VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raza VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero ENUM('MACHO', 'HEMBRA') NOT NULL,
    peso_kg DECIMAL(5,2) NULL,
    microchip_id VARCHAR(50) NULL UNIQUE,
    estado_salud VARCHAR(100) DEFAULT 'SANO',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_propietario) REFERENCES propietarios(id_propietario)
);

-- 5. TABLA DE CITAS VETERINARIAS (RF07)
CREATE TABLE citas (
    id_cita BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_mascota BIGINT UNSIGNED NOT NULL,
    id_propietario BIGINT UNSIGNED NOT NULL,
    id_veterinario BIGINT UNSIGNED NOT NULL,
    fecha_hora DATETIME NOT NULL,
    motivo_general VARCHAR(255) NOT NULL,
    tipo_cita ENUM('CONSULTA', 'VACUNACION', 'CONTROL', 'URGENCIA') NOT NULL DEFAULT 'CONSULTA',
    estado ENUM('PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_mascota) REFERENCES mascotas(id_mascota),
    FOREIGN KEY (id_propietario) REFERENCES propietarios(id_propietario),
    FOREIGN KEY (id_veterinario) REFERENCES veterinarios(id_veterinario)
);

-- 6. TABLA DE CONSULTAS MÉDICAS (RF08)
CREATE TABLE consultas (
    id_consulta BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_cita BIGINT UNSIGNED NOT NULL UNIQUE,
    id_mascota BIGINT UNSIGNED NOT NULL,
    id_veterinario BIGINT UNSIGNED NOT NULL,
    fecha_consulta DATETIME DEFAULT CURRENT_TIMESTAMP,
    frecuencia_cardiaca INT NULL,
    temperatura_c DECIMAL(4,1) NULL,
    peso_actual DECIMAL(5,2) NOT NULL,
    anamnesis_sintomas TEXT NOT NULL,
    diagnostico TEXT NOT NULL,
    tratamiento_recetado TEXT NOT NULL,
    observaciones TEXT NULL,
    FOREIGN KEY (id_cita) REFERENCES citas(id_cita),
    FOREIGN KEY (id_mascota) REFERENCES mascotas(id_mascota),
    FOREIGN KEY (id_veterinario) REFERENCES veterinarios(id_veterinario)
);

-- 7. VACUNAS Y CARNÉ DIGITAL (RF09)
CREATE TABLE vacunas (
    id_vacuna INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    tipo_vacuna VARCHAR(50) NOT NULL
);

CREATE TABLE historia_vacunacion (
    id_historia_vacuna BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_mascota BIGINT UNSIGNED NOT NULL,
    id_vacuna INT NOT NULL,
    id_veterinario BIGINT UNSIGNED NOT NULL,
    lote VARCHAR(50) NOT NULL,
    fecha_aplicacion DATE NOT NULL,
    fecha_refuerzo DATE NULL,
    observaciones VARCHAR(255) NULL,
    FOREIGN KEY (id_mascota) REFERENCES mascotas(id_mascota),
    FOREIGN KEY (id_vacuna) REFERENCES vacunas(id_vacuna),
    FOREIGN KEY (id_veterinario) REFERENCES veterinarios(id_veterinario)
);

-- 8. GENERACIONES DE IA (RF10 y RF11)
CREATE TABLE fichas_ia (
    id_ficha BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_consulta BIGINT UNSIGNED NOT NULL,
    resumen_propietario TEXT NOT NULL,
    sintesis_tecnica TEXT NOT NULL,
    modelo_utilizado VARCHAR(50) DEFAULT 'Gemini 3 Flash',
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    aprobado_por_veterinario BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_consulta) REFERENCES consultas(id_consulta)
);

CREATE TABLE reportes_ejecutivos_ia (
    id_reporte BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    periodo_inicio DATE NOT NULL,
    periodo_fin DATE NOT NULL,
    tipo_reporte ENUM('EPIDEMIOLOGICO', 'FINANCIERO', 'OPERATIVO', 'GENERAL') NOT NULL,
    analisis_narrativo TEXT NOT NULL,
    metricas_json JSON NOT NULL,
    id_usuario_admin BIGINT UNSIGNED NOT NULL,
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario_admin) REFERENCES usuarios(id_usuario)
);