CREATE TABLE IF NOT EXISTS propietarios (
    id_propietario BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT UNIQUE REFERENCES usuarios(id_usuario),
    documento_identidad VARCHAR(30) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion VARCHAR(150),
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pacientes (
    id_paciente BIGSERIAL PRIMARY KEY,
    id_propietario BIGINT NOT NULL REFERENCES propietarios(id_propietario),
    nombre VARCHAR(80) NOT NULL,
    especie VARCHAR(40) NOT NULL,
    raza VARCHAR(60),
    sexo VARCHAR(15),
    fecha_nacimiento DATE,
    peso_kg NUMERIC(5, 2) CHECK (peso_kg > 0),
    color VARCHAR(40),
    codigo_qr VARCHAR(120) UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    version INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS codigo_expediente VARCHAR(120) UNIQUE;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS microchip_id VARCHAR(60);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS historiales_clinicos (
    id_historial BIGSERIAL PRIMARY KEY,
    id_paciente BIGINT NOT NULL REFERENCES pacientes(id_paciente),
    id_veterinario BIGINT NOT NULL REFERENCES usuarios(id_usuario),
    id_cita BIGINT REFERENCES citas(id_cita),
    fecha_consulta TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motivo_consulta TEXT NOT NULL,
    diagnostico TEXT NOT NULL,
    tratamiento TEXT,
    observaciones TEXT,
    peso_registrado NUMERIC(5, 2) CHECK (peso_registrado > 0)
);

CREATE TABLE IF NOT EXISTS vacunas (
    id_vacuna BIGSERIAL PRIMARY KEY,
    id_paciente BIGINT NOT NULL REFERENCES pacientes(id_paciente),
    id_lote BIGINT REFERENCES lotes_inventario(id_lote),
    id_veterinario BIGINT NOT NULL REFERENCES usuarios(id_usuario),
    nombre_vacuna VARCHAR(100) NOT NULL,
    fecha_aplicacion DATE NOT NULL DEFAULT CURRENT_DATE,
    proxima_dosis DATE CHECK (proxima_dosis >= fecha_aplicacion),
    observaciones VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_pacientes_propietario ON pacientes(id_propietario);
CREATE INDEX IF NOT EXISTS idx_historiales_paciente ON historiales_clinicos(id_paciente);
CREATE INDEX IF NOT EXISTS idx_vacunas_paciente ON vacunas(id_paciente);

ALTER TABLE historiales_clinicos ADD COLUMN IF NOT EXISTS frecuencia_cardiaca INTEGER;
ALTER TABLE historiales_clinicos ADD COLUMN IF NOT EXISTS temperatura_c NUMERIC(5, 2);

ALTER TABLE productos ADD COLUMN IF NOT EXISTS requiere_vencimiento BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE lotes_inventario ALTER COLUMN fecha_vencimiento DROP NOT NULL;
ALTER TABLE movimientos_inventario ADD COLUMN IF NOT EXISTS cantidad_delta INTEGER;
ALTER TABLE movimientos_inventario ADD COLUMN IF NOT EXISTS id_usuario_responsable BIGINT REFERENCES usuarios(id_usuario);
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS id_cliente BIGINT REFERENCES propietarios(id_propietario);
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS id_usuario_cajero BIGINT REFERENCES usuarios(id_usuario);
ALTER TABLE detalles_factura ADD COLUMN IF NOT EXISTS id_lote BIGINT REFERENCES lotes_inventario(id_lote);
ALTER TABLE detalles_factura ADD COLUMN IF NOT EXISTS precio_unitario NUMERIC(12, 2);

CREATE TABLE IF NOT EXISTS fichas_ia (
    id_ficha BIGSERIAL PRIMARY KEY,
    id_consulta BIGINT NOT NULL UNIQUE REFERENCES historiales_clinicos(id_historial),
    resumen_propietario TEXT NOT NULL,
    sintesis_tecnica TEXT NOT NULL,
    modelo_utilizado VARCHAR(100) NOT NULL,
    fecha_generacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    aprobado_por_veterinario BOOLEAN NOT NULL DEFAULT FALSE
);
