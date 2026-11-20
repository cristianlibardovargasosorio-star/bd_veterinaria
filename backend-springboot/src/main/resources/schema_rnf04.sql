-- =============================================================================
-- MIGRACIÓN POSTGRESQL PARA VET-RNF-04: INTEGRIDAD TRANSACCIONAL Y CONCURRENCIA
-- =============================================================================

CREATE TABLE IF NOT EXISTS productos (
    id_producto BIGSERIAL PRIMARY KEY,
    sku VARCHAR(40) NOT NULL UNIQUE,
    nombre VARCHAR(120) NOT NULL,
    stock_minimo INTEGER NOT NULL CHECK (stock_minimo >= 0),
    precio_unitario NUMERIC(12, 2) NOT NULL CHECK (precio_unitario >= 0),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lotes_inventario (
    id_lote BIGSERIAL PRIMARY KEY,
    id_producto BIGINT NOT NULL REFERENCES productos(id_producto),
    codigo_lote VARCHAR(50) NOT NULL,
    fecha_ingreso DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    cantidad_disponible INTEGER NOT NULL CHECK (cantidad_disponible >= 0),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id_movimiento BIGSERIAL PRIMARY KEY,
    id_lote BIGINT NOT NULL REFERENCES lotes_inventario(id_lote),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ENTRADA', 'SALIDA', 'AJUSTE')),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    motivo VARCHAR(180) NOT NULL,
    fecha_movimiento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS citas (
    id_cita BIGSERIAL PRIMARY KEY,
    id_paciente BIGINT NOT NULL,
    id_veterinario BIGINT NOT NULL REFERENCES usuarios(id_usuario),
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo_cita VARCHAR(40) NOT NULL,
    motivo_general VARCHAR(250) NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA')),
    version BIGINT NOT NULL DEFAULT 0
);

-- Garantía atómica anti-doble reserva concurrente para el mismo veterinario y horario
CREATE UNIQUE INDEX IF NOT EXISTS uq_cita_vet_horario_activo
    ON citas (id_veterinario, fecha_hora)
    WHERE estado <> 'CANCELADA';

CREATE TABLE IF NOT EXISTS facturas (
    id_factura BIGSERIAL PRIMARY KEY,
    id_cita BIGINT REFERENCES citas(id_cita),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('PENDIENTE', 'PAGADA', 'ANULADA')),
    fecha_emision TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS detalles_factura (
    id_detalle BIGSERIAL PRIMARY KEY,
    id_factura BIGINT NOT NULL REFERENCES facturas(id_factura) ON DELETE CASCADE,
    id_producto BIGINT NOT NULL REFERENCES productos(id_producto),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0)
);

-- Índices de rendimiento (< 1000 ms)
CREATE INDEX IF NOT EXISTS idx_lotes_fefo ON lotes_inventario (id_producto, fecha_vencimiento, fecha_ingreso) WHERE cantidad_disponible > 0;
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas (fecha_hora, estado);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas (fecha_emision DESC, estado);
