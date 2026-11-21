package com.vetsoft.clinic.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/facturacion")
public class FacturacionController {
    private final JdbcTemplate jdbc;

    public FacturacionController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public Facturas listar() {
        var facturas = jdbc.queryForList("""
                SELECT f.id_factura, COALESCE(f.id_cliente, p.id_propietario, 0) AS id_cliente, f.id_usuario_cajero,
                       to_char(f.fecha_emision AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS fecha,
                       CASE f.estado WHEN 'PENDIENTE' THEN 'BORRADOR' ELSE f.estado END AS estado, f.total
                FROM facturas f LEFT JOIN citas c ON c.id_cita = f.id_cita
                LEFT JOIN pacientes p ON p.id_paciente = c.id_paciente
                ORDER BY f.fecha_emision DESC, f.id_factura DESC
                """);
        var detalles = jdbc.queryForList("""
                SELECT id_detalle, id_factura, COALESCE(id_lote, 0) AS id_lote, id_producto,
                       cantidad, COALESCE(precio_unitario, subtotal / cantidad) AS precio_unitario, subtotal
                FROM detalles_factura ORDER BY id_detalle
                """);
        return new Facturas(facturas, detalles);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Long> crear(@Valid @RequestBody NuevaFactura factura, Principal actor) {
        var ids = jdbc.query("""
                INSERT INTO facturas (id_cliente, id_usuario_cajero, total, estado)
                SELECT p.id_propietario, u.id_usuario, 0, 'PENDIENTE'
                FROM propietarios p CROSS JOIN usuarios u WHERE p.id_propietario = ? AND u.correo = ?
                RETURNING id_factura
                """, (fila, numero) -> fila.getLong(1), factura.idCliente(), actor.getName());
        if (ids.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona un cliente registrado.");
        }
        return Map.of("idFactura", ids.getFirst());
    }

    @PostMapping("/{id}/detalles")
    @Transactional
    public Map<String, String> agregar(@PathVariable long id, @Valid @RequestBody NuevoDetalle detalle) {
        bloquearBorrador(id);
        var lotes = jdbc.query("""
                SELECT l.id_producto, l.cantidad_disponible, p.precio_unitario
                FROM lotes_inventario l JOIN productos p USING (id_producto)
                WHERE l.id_lote = ? AND (l.fecha_vencimiento IS NULL OR l.fecha_vencimiento >= CURRENT_DATE)
                """, (fila, numero) -> new LoteVenta(fila.getLong(1), fila.getInt(2), fila.getBigDecimal(3)), detalle.idLote());
        if (lotes.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El lote no existe o está vencido.");
        }
        var lote = lotes.getFirst();
        Long cantidadActual = jdbc.queryForObject("""
                SELECT COALESCE(SUM(cantidad), 0) FROM detalles_factura WHERE id_factura = ? AND id_lote = ?
                """, Long.class, id, detalle.idLote());
        long cantidadFinal = cantidadActual + detalle.cantidad();
        if (cantidadFinal > lote.stock()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El lote no tiene stock suficiente.");
        }
        var subtotal = lote.precio().multiply(java.math.BigDecimal.valueOf(cantidadFinal));
        int modificadas = jdbc.update("""
                UPDATE detalles_factura SET cantidad = ?, precio_unitario = ?, subtotal = ?
                WHERE id_factura = ? AND id_lote = ?
                """, (int) cantidadFinal, lote.precio(), subtotal, id, detalle.idLote());
        if (modificadas == 0) {
            jdbc.update("""
                    INSERT INTO detalles_factura (id_factura, id_lote, id_producto, cantidad, precio_unitario, subtotal)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, id, detalle.idLote(), lote.producto(), detalle.cantidad(), lote.precio(), subtotal);
        }
        jdbc.update("""
                UPDATE facturas SET total = (SELECT SUM(subtotal) FROM detalles_factura WHERE id_factura = ?),
                       version = version + 1 WHERE id_factura = ?
                """, id, id);
        return Map.of("mensaje", "Producto agregado a la factura.");
    }

    @PostMapping("/{id}/confirmar")
    @Transactional
    public Map<String, String> confirmar(@PathVariable long id, Principal actor) {
        bloquearBorrador(id);
        var lineas = jdbc.query("""
                SELECT id_lote, SUM(cantidad) AS unidades FROM detalles_factura
                WHERE id_factura = ? GROUP BY id_lote ORDER BY id_lote
                """, (fila, numero) -> new Consumo(fila.getObject(1, Long.class), fila.getInt(2)), id);
        if (lineas.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Agrega al menos un producto a la factura.");
        }
        for (var linea : lineas) {
            int modificado = jdbc.update("""
                    UPDATE lotes_inventario SET cantidad_disponible = cantidad_disponible - ?, version = version + 1
                    WHERE id_lote = ? AND cantidad_disponible >= ?
                      AND (fecha_vencimiento IS NULL OR fecha_vencimiento >= CURRENT_DATE)
                    """, linea.cantidad(), linea.lote(), linea.cantidad());
            if (modificado == 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Un lote está vencido o ya no tiene stock suficiente.");
            }
            jdbc.update("""
                    INSERT INTO movimientos_inventario (id_lote, tipo, cantidad, cantidad_delta, motivo, id_usuario_responsable)
                    VALUES (?, 'SALIDA', ?, ?, ?, (SELECT id_usuario FROM usuarios WHERE correo = ?))
                    """, linea.lote(), linea.cantidad(), -linea.cantidad(), "Venta POS #" + id, actor.getName());
        }
        jdbc.update("UPDATE facturas SET estado = 'PAGADA', version = version + 1 WHERE id_factura = ?", id);
        return Map.of("mensaje", "Venta confirmada.");
    }

    @PostMapping("/{id}/anular")
    @Transactional
    public Map<String, String> anular(@PathVariable long id) {
        bloquearBorrador(id);
        jdbc.update("UPDATE facturas SET estado = 'ANULADA', version = version + 1 WHERE id_factura = ?", id);
        return Map.of("mensaje", "Factura anulada.");
    }

    private void bloquearBorrador(long id) {
        var estados = jdbc.query("SELECT estado FROM facturas WHERE id_factura = ? FOR UPDATE",
                (fila, numero) -> fila.getString(1), id);
        if (estados.isEmpty() || !estados.getFirst().equals("PENDIENTE")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La factura ya no está en borrador.");
        }
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> estado(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("mensaje", ex.getReason()));
    }

    public record Facturas(List<Map<String, Object>> facturas, List<Map<String, Object>> detallesFactura) {}
    public record NuevaFactura(@Positive long idCliente) {}
    public record NuevoDetalle(@Positive long idLote, @Positive int cantidad) {}
    private record LoteVenta(long producto, int stock, java.math.BigDecimal precio) {}
    private record Consumo(Long lote, int cantidad) {}
}
