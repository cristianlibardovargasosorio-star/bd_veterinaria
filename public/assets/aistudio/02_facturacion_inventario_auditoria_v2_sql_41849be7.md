-- =============================================================================
-- SISTEMA DE GESTIÓN VETERINARIA (VETSOFT) - MÓDULO FACTURACIÓN E INVENTARIO V2
-- Integra las reglas de la Sesión 2 con los requerimientos del SRS (Auditoría e IA)
-- =============================================================================

USE veterinaria_adso;

-- 1. CATÁLOGOS BASE Y PRODUCTOS
CREATE TABLE IF NOT EXISTS productos (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  precio_venta DECIMAL(12,2) NOT NULL,
  stock_minimo INT NOT NULL DEFAULT 5,
  requiere_vencimiento BOOLEAN NOT NULL DEFAULT TRUE,
  activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lotes (
  id_lote BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_producto INT NOT NULL,
  codigo_lote VARCHAR(50) NOT NULL,
  fecha_vencimiento DATE NULL,
  stock_actual INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_lote_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB;

-- 2. TRIGGERS DE CONTROL DE VENCIMIENTO DE LOTES
DELIMITER $$
CREATE TRIGGER trg_lote_vencimiento_bi
BEFORE INSERT ON lotes FOR EACH ROW
BEGIN
  DECLARE v_requiere BOOLEAN DEFAULT FALSE;
  SELECT requiere_vencimiento INTO v_requiere
  FROM productos WHERE id_producto=NEW.id_producto;
  IF v_requiere=TRUE AND NEW.fecha_vencimiento IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='El producto requiere fecha de vencimiento por lote';
  END IF;
END$$

CREATE TRIGGER trg_lote_vencimiento_bu
BEFORE UPDATE ON lotes FOR EACH ROW
BEGIN
  DECLARE v_requiere BOOLEAN DEFAULT FALSE;
  SELECT requiere_vencimiento INTO v_requiere
  FROM productos WHERE id_producto=NEW.id_producto;
  IF v_requiere=TRUE AND NEW.fecha_vencimiento IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='El producto requiere fecha de vencimiento por lote';
  END IF;
END$$
DELIMITER ;

-- 3. FACTURACIÓN E INVENTARIO CON USUARIOS Y AUDITORÍA
CREATE TABLE IF NOT EXISTS facturas (
  id_factura BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL,
  id_usuario_cajero BIGINT UNSIGNED NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('BORRADOR','PAGADA','ANULADA') NOT NULL DEFAULT 'BORRADOR',
  total DECIMAL(14,2) NOT NULL DEFAULT 0,
  CONSTRAINT chk_factura_total CHECK (total >= 0),
  CONSTRAINT fk_factura_cajero FOREIGN KEY (id_usuario_cajero) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detalle_factura (
  id_detalle BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_factura BIGINT NOT NULL,
  id_lote BIGINT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(14,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  UNIQUE KEY uq_factura_lote (id_factura,id_lote),
  CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0),
  CONSTRAINT chk_detalle_precio CHECK (precio_unitario > 0),
  CONSTRAINT fk_detalle_factura FOREIGN KEY(id_factura) REFERENCES facturas(id_factura),
  CONSTRAINT fk_detalle_lote FOREIGN KEY(id_lote) REFERENCES lotes(id_lote)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id_movimiento BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_lote BIGINT NOT NULL,
  id_detalle BIGINT NULL,
  id_usuario_responsable BIGINT UNSIGNED NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo ENUM('APERTURA','VENTA','AJUSTE') NOT NULL,
  cantidad_delta INT NOT NULL,
  motivo VARCHAR(220) NOT NULL,
  UNIQUE KEY uq_movimiento_detalle(id_detalle),
  CONSTRAINT chk_movimiento_no_cero CHECK(cantidad_delta<>0),
  CONSTRAINT fk_movimiento_lote FOREIGN KEY(id_lote) REFERENCES lotes(id_lote),
  CONSTRAINT fk_movimiento_detalle FOREIGN KEY(id_detalle) REFERENCES detalle_factura(id_detalle),
  CONSTRAINT fk_movimiento_usuario FOREIGN KEY(id_usuario_responsable) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS auditoria_sistema (
    id_auditoria BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT UNSIGNED NULL,
    tabla_afectada VARCHAR(100) NOT NULL,
    operacion ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    detalles TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- 4. VISTAS DE MONITOREO Y ALERTAS
CREATE OR REPLACE VIEW vw_existencias AS
SELECT p.id_producto, p.sku, p.nombre, p.stock_minimo, p.activo,
  COALESCE(SUM(l.stock_actual),0) AS stock_fisico,
  COALESCE(SUM(CASE WHEN l.fecha_vencimiento IS NULL OR l.fecha_vencimiento>=CURDATE()
                 THEN l.stock_actual ELSE 0 END),0) AS stock_vendible,
  COALESCE(SUM(CASE WHEN l.fecha_vencimiento<CURDATE()
                 THEN l.stock_actual ELSE 0 END),0) AS stock_vencido
FROM productos p LEFT JOIN lotes l ON l.id_producto=p.id_producto
GROUP BY p.id_producto, p.sku, p.nombre, p.stock_minimo, p.activo;

CREATE OR REPLACE VIEW vw_alertas_stock AS
SELECT id_producto, sku, nombre, stock_minimo, stock_vendible
FROM vw_existencias
WHERE activo=TRUE AND stock_vendible<=stock_minimo;

-- 5. PROCEDIMIENTOS ALMACENADOS DE FACTURACIÓN CONTROLADA
DELIMITER $$
CREATE PROCEDURE sp_crear_factura(IN p_cliente INT, IN p_cajero BIGINT, OUT p_factura BIGINT)
BEGIN
  INSERT INTO facturas(id_cliente, id_usuario_cajero, estado) 
  VALUES(p_cliente, p_cajero, 'BORRADOR');
  SET p_factura=LAST_INSERT_ID();
END$$

CREATE PROCEDURE sp_agregar_detalle(IN p_factura BIGINT, IN p_lote BIGINT, IN p_cantidad INT)
BEGIN
  DECLARE v_estado VARCHAR(15) DEFAULT NULL;
  DECLARE v_precio DECIMAL(12,2) DEFAULT NULL;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  IF p_cantidad IS NULL OR p_cantidad<=0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='La cantidad debe ser positiva';
  END IF;
  START TRANSACTION;
  SELECT estado INTO v_estado FROM facturas WHERE id_factura=p_factura FOR UPDATE;
  IF v_estado IS NULL OR v_estado<>'BORRADOR' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='La factura no existe o no esta en borrador';
  END IF;
  SELECT p.precio_venta INTO v_precio FROM lotes l
  JOIN productos p ON p.id_producto=l.id_producto
  WHERE l.id_lote=p_lote AND p.activo=TRUE;
  IF v_precio IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Lote inexistente o producto inactivo';
  END IF;
  INSERT INTO detalle_factura(id_factura, id_lote, cantidad, precio_unitario)
  VALUES(p_factura, p_lote, p_cantidad, v_precio);
  COMMIT;
END$$

CREATE PROCEDURE sp_confirmar_factura(IN p_factura BIGINT, IN p_responsable BIGINT)
BEGIN
  DECLARE v_fin BOOLEAN DEFAULT FALSE;
  DECLARE v_estado VARCHAR(15) DEFAULT NULL;
  DECLARE v_num INT DEFAULT 0;
  DECLARE v_detalle BIGINT;
  DECLARE v_lote BIGINT;
  DECLARE v_cantidad INT;
  DECLARE cur_detalles CURSOR FOR
    SELECT id_detalle, id_lote, cantidad FROM detalle_factura
    WHERE id_factura=p_factura ORDER BY id_lote, id_detalle;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fin=TRUE;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  SELECT estado INTO v_estado FROM facturas WHERE id_factura=p_factura FOR UPDATE;
  IF v_estado IS NULL OR v_estado<>'BORRADOR' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Factura inexistente o ya procesada';
  END IF;
  SELECT COUNT(*) INTO v_num FROM detalle_factura WHERE id_factura=p_factura;
  IF v_num=0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='La factura necesita al menos un producto';
  END IF;
  SET v_fin=FALSE;
  OPEN cur_detalles;
  detalle_loop: LOOP
    FETCH cur_detalles INTO v_detalle, v_lote, v_cantidad;
    IF v_fin THEN LEAVE detalle_loop; END IF;
    UPDATE lotes SET stock_actual=stock_actual-v_cantidad
      WHERE id_lote=v_lote
        AND stock_actual>=v_cantidad
        AND (fecha_vencimiento IS NULL OR fecha_vencimiento>=CURDATE());
    IF ROW_COUNT()<>1 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT='Stock insuficiente o lote vencido: venta revertida';
    END IF;
    INSERT INTO movimientos_inventario(id_lote, id_detalle, id_usuario_responsable, tipo, cantidad_delta, motivo)
    VALUES(v_lote, v_detalle, p_responsable, 'VENTA', -v_cantidad, CONCAT('Venta factura ', p_factura));
  END LOOP;
  CLOSE cur_detalles;
  UPDATE facturas
    SET estado='PAGADA',
        total=(SELECT COALESCE(SUM(subtotal),0) FROM detalle_factura WHERE id_factura=p_factura)
  WHERE id_factura=p_factura;
  COMMIT;
END$$
DELIMITER ;