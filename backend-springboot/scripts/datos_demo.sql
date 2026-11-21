-- Carga manual para una instalación local. Ejecutar con psql y -v clave_demo=...
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO usuarios (nombre_completo, correo, contrasena, rol)
SELECT nombre, correo, crypt(:'clave_demo', gen_salt('bf', 12)), rol
FROM (VALUES
    ('Dra. Laura Beltrán', 'laura.beltran@demo.vetsoft.test', 'VETERINARIO'),
    ('Dr. Mateo Ríos', 'mateo.rios@demo.vetsoft.test', 'VETERINARIO'),
    ('Valentina Torres', 'valentina.torres@demo.vetsoft.test', 'PROPIETARIO'),
    ('Daniel Pardo', 'daniel.pardo@demo.vetsoft.test', 'PROPIETARIO'),
    ('Sofía Ruiz', 'sofia.ruiz@demo.vetsoft.test', 'PROPIETARIO')
) AS cuenta(nombre, correo, rol)
ON CONFLICT (correo) DO NOTHING;

INSERT INTO propietarios (id_usuario, documento_identidad, telefono)
SELECT u.id_usuario, d.documento, d.telefono
FROM (VALUES
    ('valentina.torres@demo.vetsoft.test', 'DEMO-TUTOR-01', '0000000001'),
    ('daniel.pardo@demo.vetsoft.test', 'DEMO-TUTOR-02', '0000000002'),
    ('sofia.ruiz@demo.vetsoft.test', 'DEMO-TUTOR-03', '0000000003')
) AS d(correo, documento, telefono)
JOIN usuarios u USING (correo)
ON CONFLICT (id_usuario) DO NOTHING;

INSERT INTO pacientes (id_propietario, nombre, especie, raza, sexo, fecha_nacimiento,
                       peso_kg, color, codigo_qr, codigo_expediente)
SELECT t.id_propietario, d.nombre, d.especie, d.raza, d.sexo, d.nacimiento,
       d.peso, d.color, 'QR-' || d.expediente, d.expediente
FROM (VALUES
    ('valentina.torres@demo.vetsoft.test', 'Luna', 'Felino', 'Criollo', 'HEMBRA', DATE '2022-04-10', 4.30, 'Tricolor', 'DEMO-PAC-01'),
    ('valentina.torres@demo.vetsoft.test', 'Bruno', 'Canino', 'Labrador', 'MACHO', DATE '2021-08-21', 31.20, 'Chocolate', 'DEMO-PAC-02'),
    ('daniel.pardo@demo.vetsoft.test', 'Milo', 'Canino', 'Beagle', 'MACHO', DATE '2023-01-18', 12.40, 'Tricolor', 'DEMO-PAC-03'),
    ('sofia.ruiz@demo.vetsoft.test', 'Nala', 'Felino', 'Siamés', 'HEMBRA', DATE '2024-02-12', 3.70, 'Crema', 'DEMO-PAC-04')
) AS d(correo, nombre, especie, raza, sexo, nacimiento, peso, color, expediente)
JOIN usuarios u USING (correo)
JOIN propietarios t USING (id_usuario)
ON CONFLICT (codigo_expediente) DO NOTHING;

INSERT INTO productos (sku, nombre, precio_unitario, stock_minimo, requiere_vencimiento)
VALUES
    ('DEMO-VAC-AR', 'Vacuna antirrábica', 12.00, 5, TRUE),
    ('DEMO-VAC-CN', 'Vacuna múltiple canina', 20.00, 6, TRUE),
    ('DEMO-VAC-FL', 'Vacuna triple felina', 18.00, 5, TRUE),
    ('DEMO-MED-01', 'Antiparasitario veterinario', 8.50, 10, TRUE),
    ('DEMO-MED-02', 'Antiséptico tópico veterinario', 7.00, 6, TRUE),
    ('DEMO-MED-03', 'Solución salina estéril', 5.00, 5, TRUE),
    ('DEMO-INS-01', 'Gasas estériles', 4.00, 5, FALSE)
ON CONFLICT (sku) DO NOTHING;

WITH apertura AS (
    INSERT INTO lotes_inventario (id_producto, codigo_lote, fecha_ingreso, fecha_vencimiento, cantidad_disponible)
    SELECT p.id_producto, d.lote, CURRENT_DATE - 45, CURRENT_DATE + d.dias, d.stock
    FROM (VALUES
        ('DEMO-VAC-AR', 'DEMO-AR-01', 120, 2),
        ('DEMO-VAC-CN', 'DEMO-CN-01', 240, 14),
        ('DEMO-VAC-FL', 'DEMO-FL-01', 4, 2),
        ('DEMO-MED-01', 'DEMO-AP-01', 180, 3),
        ('DEMO-MED-02', 'DEMO-AT-01', 150, 20),
        ('DEMO-MED-03', 'DEMO-SS-01', -3, 7),
        ('DEMO-INS-01', 'DEMO-GA-01', NULL, 28)
    ) AS d(sku, lote, dias, stock)
    JOIN productos p USING (sku)
    WHERE NOT EXISTS (
        SELECT 1 FROM lotes_inventario l WHERE l.id_producto = p.id_producto AND l.codigo_lote = d.lote
    )
    RETURNING id_lote, cantidad_disponible
)
INSERT INTO movimientos_inventario (id_lote, tipo, cantidad, cantidad_delta, motivo)
SELECT id_lote, 'ENTRADA', cantidad_disponible, cantidad_disponible, 'Apertura de inventario de demostración'
FROM apertura;

INSERT INTO citas (id_paciente, id_veterinario, fecha_hora, tipo_cita, motivo_general, estado)
SELECT p.id_paciente, v.id_usuario, (CURRENT_DATE + d.dias + d.hora) AT TIME ZONE 'America/Bogota',
       d.tipo, d.motivo, d.estado
FROM (VALUES
    ('DEMO-PAC-01', 'laura.beltran@demo.vetsoft.test', -15, TIME '09:00', 'CONTROL', 'DEMO: Control preventivo felino', 'ATENDIDA'),
    ('DEMO-PAC-02', 'mateo.rios@demo.vetsoft.test', -13, TIME '10:00', 'CONTROL', 'DEMO: Revisión general de Bruno', 'ATENDIDA'),
    ('DEMO-PAC-03', 'mateo.rios@demo.vetsoft.test', -9, TIME '11:30', 'VACUNACION', 'DEMO: Revisión de carné canino', 'ATENDIDA'),
    ('DEMO-PAC-04', 'laura.beltran@demo.vetsoft.test', -6, TIME '15:00', 'VACUNACION', 'DEMO: Revisión de carné felino', 'ATENDIDA'),
    ('DEMO-PAC-01', 'laura.beltran@demo.vetsoft.test', 2, TIME '09:00', 'CONTROL', 'DEMO: Seguimiento de Luna', 'CONFIRMADA'),
    ('DEMO-PAC-03', 'mateo.rios@demo.vetsoft.test', 4, TIME '10:30', 'CONSULTA', 'DEMO: Próximo control de Milo', 'PENDIENTE')
) AS d(expediente, correo, dias, hora, tipo, motivo, estado)
JOIN pacientes p ON p.codigo_expediente = d.expediente
JOIN usuarios v USING (correo)
WHERE NOT EXISTS (
    SELECT 1 FROM citas c WHERE c.id_paciente = p.id_paciente AND c.motivo_general = d.motivo
);

INSERT INTO historiales_clinicos (id_paciente, id_veterinario, id_cita, fecha_consulta, motivo_consulta,
                                diagnostico, tratamiento, observaciones, peso_registrado)
SELECT p.id_paciente, c.id_veterinario, c.id_cita, c.fecha_hora, c.motivo_general, d.diagnostico,
       'Registro ficticio sin prescripción', 'Historia clínica de demostración', p.peso_kg
FROM (VALUES
    ('DEMO-PAC-01', 'Evaluación preventiva registrada'),
    ('DEMO-PAC-02', 'Revisión de condición corporal registrada'),
    ('DEMO-PAC-03', 'Control preventivo canino registrado'),
    ('DEMO-PAC-04', 'Control preventivo felino registrado')
) AS d(expediente, diagnostico)
JOIN pacientes p ON p.codigo_expediente = d.expediente
JOIN citas c ON c.id_paciente = p.id_paciente AND c.estado = 'ATENDIDA' AND c.motivo_general LIKE 'DEMO:%'
WHERE NOT EXISTS (SELECT 1 FROM historiales_clinicos h WHERE h.id_cita = c.id_cita);

INSERT INTO fichas_ia (id_consulta, resumen_propietario, sintesis_tecnica, modelo_utilizado, fecha_generacion)
SELECT h.id_historial,
       concat(p.nombre, ' asistió a una revisión programada. Se registró su peso y el motivo de la visita. Este resumen pertenece a un caso ficticio.'),
       concat('Caso de demostración. ', h.diagnostico, '. Motivo: ', h.motivo_consulta, '. Sin prescripción clínica.'),
       'Datos de demostración VetSoft', h.fecha_consulta
FROM historiales_clinicos h JOIN pacientes p ON p.id_paciente = h.id_paciente
WHERE p.codigo_expediente IN ('DEMO-PAC-01', 'DEMO-PAC-02', 'DEMO-PAC-03', 'DEMO-PAC-04')
  AND h.observaciones = 'Historia clínica de demostración'
ON CONFLICT (id_consulta) DO NOTHING;

INSERT INTO vacunas (id_paciente, id_lote, id_veterinario, nombre_vacuna, fecha_aplicacion, proxima_dosis, observaciones)
SELECT h.id_paciente, l.id_lote, h.id_veterinario, d.nombre, h.fecha_consulta::date,
       h.fecha_consulta::date + 365, 'Aplicación ficticia para mostrar el carné'
FROM (VALUES
    ('DEMO-PAC-01', 'DEMO-FL-01', 'Vacuna triple felina'),
    ('DEMO-PAC-02', 'DEMO-AR-01', 'Vacuna antirrábica'),
    ('DEMO-PAC-03', 'DEMO-CN-01', 'Vacuna múltiple canina'),
    ('DEMO-PAC-04', 'DEMO-FL-01', 'Vacuna triple felina')
) AS d(expediente, lote, nombre)
JOIN pacientes p ON p.codigo_expediente = d.expediente
JOIN historiales_clinicos h ON h.id_paciente = p.id_paciente AND h.observaciones = 'Historia clínica de demostración'
JOIN lotes_inventario l ON l.codigo_lote = d.lote
WHERE NOT EXISTS (SELECT 1 FROM vacunas v WHERE v.id_paciente = p.id_paciente AND v.id_lote = l.id_lote
                  AND v.observaciones = 'Aplicación ficticia para mostrar el carné');

WITH lote_venta AS (
    UPDATE lotes_inventario l SET cantidad_disponible = cantidad_disponible - 2, version = version + 1
    WHERE l.codigo_lote = 'DEMO-GA-01' AND l.cantidad_disponible >= 2
      AND NOT EXISTS (SELECT 1 FROM movimientos_inventario m WHERE m.id_lote = l.id_lote
                      AND m.motivo = 'Venta de demostración VetSoft')
    RETURNING id_lote, id_producto
), venta AS (
    INSERT INTO facturas (id_cliente, id_cita, total, estado)
    SELECT p.id_propietario, c.id_cita, pr.precio_unitario * 2, 'PAGADA'
    FROM lote_venta l JOIN productos pr USING (id_producto)
    CROSS JOIN pacientes p JOIN citas c ON c.id_paciente = p.id_paciente AND c.motivo_general = 'DEMO: Control preventivo felino'
    WHERE p.codigo_expediente = 'DEMO-PAC-01'
    RETURNING id_factura
), detalle AS (
    INSERT INTO detalles_factura (id_factura, id_producto, id_lote, cantidad, precio_unitario, subtotal)
    SELECT v.id_factura, l.id_producto, l.id_lote, 2, p.precio_unitario, p.precio_unitario * 2
    FROM venta v CROSS JOIN lote_venta l JOIN productos p USING (id_producto)
    RETURNING id_lote
)
INSERT INTO movimientos_inventario (id_lote, tipo, cantidad, cantidad_delta, motivo)
SELECT id_lote, 'SALIDA', 2, -2, 'Venta de demostración VetSoft' FROM detalle;

COMMIT;
