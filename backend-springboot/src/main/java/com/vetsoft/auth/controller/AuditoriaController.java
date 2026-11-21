package com.vetsoft.auth.controller;

import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuditoriaController {
    private final JdbcTemplate jdbc;

    public AuditoriaController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/api/auditoria")
    public List<Map<String, Object>> listar() {
        return jdbc.queryForList("""
                SELECT a.id_auditoria, a.id_usuario, u.correo AS usuario_nombre, 'usuarios' AS tabla_afectada,
                       'UPDATE' AS operacion, a.evento AS detalles,
                       to_char(a.fecha_evento AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS fecha
                FROM auditoria_accesos a JOIN usuarios u USING (id_usuario)
                ORDER BY a.fecha_evento DESC, a.id_auditoria DESC LIMIT 500
                """);
    }
}
