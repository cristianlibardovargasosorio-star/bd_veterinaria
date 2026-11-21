package com.vetsoft.clinic.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/inventario")
public class InventarioController {
    private final JdbcTemplate jdbc;

    public InventarioController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public Existencias listar() {
        var productos = jdbc.queryForList("""
                SELECT id_producto, sku, nombre, precio_unitario AS precio_venta, stock_minimo, requiere_vencimiento,
                       TRUE AS activo FROM productos ORDER BY nombre, id_producto
                """);
        var lotes = jdbc.queryForList("""
                SELECT id_lote, id_producto, codigo_lote, fecha_vencimiento::text AS fecha_vencimiento,
                       cantidad_disponible AS stock_actual FROM lotes_inventario ORDER BY codigo_lote, id_lote
                """);
        var movimientos = jdbc.queryForList("""
                SELECT id_movimiento, id_lote, NULL AS id_detalle, id_usuario_responsable,
                       to_char(fecha_movimiento AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS fecha,
                       CASE tipo WHEN 'ENTRADA' THEN 'APERTURA' WHEN 'SALIDA' THEN 'VENTA' ELSE tipo END AS tipo,
                       COALESCE(cantidad_delta, CASE WHEN tipo = 'SALIDA' THEN -cantidad ELSE cantidad END)
                           AS cantidad_delta, motivo
                FROM movimientos_inventario ORDER BY fecha_movimiento DESC, id_movimiento DESC
                """);
        return new Existencias(productos, lotes, movimientos);
    }

    @PostMapping("/productos")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Long> crearProducto(@Valid @RequestBody NuevoProducto producto) {
        Long id = jdbc.queryForObject("""
                INSERT INTO productos (sku, nombre, precio_unitario, stock_minimo, requiere_vencimiento)
                VALUES (upper(?), ?, ?, ?, ?) RETURNING id_producto
                """, Long.class, producto.sku().trim(), producto.nombre().trim(), producto.precioVenta(),
                producto.stockMinimo(), producto.requiereVencimiento());
        return Map.of("idProducto", id);
    }

    @PostMapping("/lotes")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Map<String, Long> crearLote(@Valid @RequestBody NuevoLote lote, Principal actor) {
        var productos = jdbc.query("SELECT requiere_vencimiento FROM productos WHERE id_producto = ? FOR UPDATE",
                (fila, numero) -> fila.getBoolean(1), lote.idProducto());
        if (productos.isEmpty() || (productos.getFirst() && lote.fechaVencimiento() == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona un producto y completa su vencimiento si lo requiere.");
        }
        String codigo = lote.codigoLote().trim();
        if (Boolean.TRUE.equals(jdbc.queryForObject("""
                SELECT EXISTS (SELECT 1 FROM lotes_inventario WHERE id_producto = ? AND codigo_lote = ?)
                """, Boolean.class, lote.idProducto(), codigo))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El producto ya tiene un lote con ese código.");
        }
        Long id = jdbc.queryForObject("""
                INSERT INTO lotes_inventario (id_producto, codigo_lote, fecha_ingreso, fecha_vencimiento, cantidad_disponible)
                VALUES (?, ?, CURRENT_DATE, ?, ?) RETURNING id_lote
                """, Long.class, lote.idProducto(), codigo, lote.fechaVencimiento(), lote.stockActual());
        if (lote.stockActual() > 0) {
            registrarMovimiento(id, lote.stockActual(), "ENTRADA", "Apertura del lote", actor.getName());
        }
        return Map.of("idLote", id);
    }

    @PostMapping("/ajustes")
    @Transactional
    public Map<String, String> ajustar(@Valid @RequestBody Ajuste ajuste, Principal actor) {
        if (ajuste.delta() == 0 || ajuste.delta() == Integer.MIN_VALUE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ingresa una cantidad de ajuste válida.");
        }
        int stock = jdbc.update("""
                UPDATE lotes_inventario SET cantidad_disponible = cantidad_disponible + ?, version = version + 1
                WHERE id_lote = ? AND cantidad_disponible::bigint + ? BETWEEN 0 AND 2147483647
                """, ajuste.delta(), ajuste.idLote(), ajuste.delta());
        if (stock == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El lote no existe o el ajuste supera el stock permitido.");
        }
        registrarMovimiento(ajuste.idLote(), ajuste.delta(), "AJUSTE", ajuste.motivo().trim(), actor.getName());
        return Map.of("mensaje", "Ajuste guardado.");
    }

    private void registrarMovimiento(long lote, int cantidad, String tipo, String motivo, String actor) {
        jdbc.update("""
                INSERT INTO movimientos_inventario (id_lote, cantidad, cantidad_delta, tipo, motivo, id_usuario_responsable)
                VALUES (?, ?, ?, ?, ?, (SELECT id_usuario FROM usuarios WHERE correo = ?))
                """, lote, Math.abs(cantidad), cantidad, tipo, motivo, actor);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> estado(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("mensaje", ex.getReason()));
    }

    @ExceptionHandler(DuplicateKeyException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> duplicado() {
        return Map.of("mensaje", "Ese SKU ya está registrado.");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> validacion() {
        return Map.of("mensaje", "Revisa el producto, el lote y las cantidades ingresadas.");
    }

    public record Existencias(List<Map<String, Object>> productos, List<Map<String, Object>> lotes,
                              List<Map<String, Object>> movimientos) {}
    public record NuevoProducto(@NotBlank @Size(max = 40) String sku, @NotBlank @Size(max = 120) String nombre,
                                @NotNull @PositiveOrZero @DecimalMax("9999999999.99") BigDecimal precioVenta,
                                @PositiveOrZero int stockMinimo, boolean requiereVencimiento) {}
    public record NuevoLote(@Positive long idProducto, @NotBlank @Size(max = 50) String codigoLote,
                            LocalDate fechaVencimiento, @PositiveOrZero int stockActual) {}
    public record Ajuste(@Positive long idLote, int delta, @NotBlank @Size(max = 180) String motivo) {}
}
