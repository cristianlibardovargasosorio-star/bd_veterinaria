package com.vetsoft.clinic.controller;

import com.vetsoft.clinic.service.AgendaTransaccionalService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/pacientes")
public class PacientesController {
    private static final String PACIENTES = """
            SELECT p.id_paciente, p.id_propietario, p.nombre, p.especie, p.raza, p.sexo,
                   p.fecha_nacimiento, p.peso_kg, p.microchip_id, p.activo, p.fecha_registro,
                   COALESCE(p.codigo_expediente, p.codigo_qr, CONCAT('PAC-', p.id_paciente)) AS expediente
            FROM pacientes p JOIN propietarios t ON t.id_propietario = p.id_propietario
            LEFT JOIN usuarios u ON u.id_usuario = t.id_usuario
            """;
    private static final String PROPIETARIOS = """
            SELECT t.id_propietario, t.id_usuario, COALESCE(u.nombre_completo, 'Tutor') AS nombre,
                   t.documento_identidad, t.telefono, t.direccion
            FROM propietarios t LEFT JOIN usuarios u ON u.id_usuario = t.id_usuario
            """;

    private final JdbcTemplate jdbc;
    private final AgendaTransaccionalService agenda;

    public PacientesController(JdbcTemplate jdbc, AgendaTransaccionalService agenda) {
        this.jdbc = jdbc;
        this.agenda = agenda;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public Listado listar(Authentication usuario) {
        boolean puedeVerConsultas = usuario.getAuthorities().stream()
                .noneMatch(rol -> rol.getAuthority().equals("ROLE_RECEPCIONISTA"));
        return cargar("", new Object[0], puedeVerConsultas, false);
    }

    @GetMapping("/mis-mascotas")
    @Transactional(readOnly = true)
    public Listado listarPropias(Principal usuario) {
        return cargar(" WHERE u.correo = ?", new Object[] { usuario.getName() }, true, true);
    }

    private Listado cargar(String filtro, Object[] parametros, boolean puedeVerConsultas, boolean esTutor) {
        var pacientes = jdbc.query(PACIENTES + filtro + " ORDER BY p.nombre, p.id_paciente",
                (fila, numero) -> new Paciente(
                        fila.getLong("id_paciente"), fila.getLong("id_propietario"), fila.getString("expediente"),
                        fila.getString("nombre"), fila.getString("especie"), fila.getString("raza"),
                        fila.getString("sexo"), fila.getObject("fecha_nacimiento", LocalDate.class),
                        fila.getBigDecimal("peso_kg"), fila.getString("microchip_id"),
                        fila.getBoolean("activo"), fila.getObject("fecha_registro", OffsetDateTime.class)), parametros);
        var propietarios = jdbc.query(PROPIETARIOS + filtro + " ORDER BY nombre, t.id_propietario",
                (fila, numero) -> new Propietario(fila.getLong("id_propietario"),
                        fila.getObject("id_usuario", Long.class), fila.getString("nombre"),
                        fila.getString("documento_identidad"), fila.getString("telefono"),
                        fila.getString("direccion")), parametros);
        String vinculos = """
                 JOIN pacientes p ON p.id_paciente = r.id_paciente
                 JOIN propietarios t ON t.id_propietario = p.id_propietario
                 LEFT JOIN usuarios u ON u.id_usuario = t.id_usuario
                """;
        var citas = jdbc.queryForList("""
                SELECT r.id_cita, r.id_paciente AS id_mascota, p.id_propietario, r.id_veterinario,
                       to_char(r.fecha_hora AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS fecha_hora,
                       r.tipo_cita, r.motivo_general, r.estado
                FROM citas r
                """ + vinculos + filtro + " ORDER BY r.fecha_hora DESC, r.id_cita DESC", parametros);
        List<Map<String, Object>> consultas = puedeVerConsultas ? jdbc.queryForList("""
                SELECT r.id_historial AS id_consulta, r.id_cita, r.id_paciente AS id_mascota, r.id_veterinario,
                       to_char(r.fecha_consulta AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS fecha_consulta,
                       r.peso_registrado AS peso_actual,
                       r.motivo_consulta AS anamnesis_sintomas, r.frecuencia_cardiaca, r.temperatura_c,
                       r.diagnostico, r.tratamiento AS tratamiento_recetado, r.observaciones
                FROM historiales_clinicos r
                """ + vinculos + filtro + " ORDER BY r.fecha_consulta DESC, r.id_historial DESC", parametros) : List.of();
        var vacunas = jdbc.queryForList("""
                SELECT r.id_vacuna AS id_historia_vacuna, r.id_paciente AS id_mascota, r.nombre_vacuna,
                       r.id_veterinario, l.codigo_lote AS lote, r.fecha_aplicacion::text AS fecha_aplicacion,
                       r.proxima_dosis::text AS fecha_refuerzo, r.observaciones
                FROM vacunas r LEFT JOIN lotes_inventario l ON l.id_lote = r.id_lote
                """ + vinculos + filtro + " ORDER BY r.fecha_aplicacion DESC, r.id_vacuna DESC", parametros);
        var veterinarios = jdbc.queryForList("""
                SELECT id_usuario AS id_veterinario, id_usuario, nombre_completo AS nombre
                FROM usuarios WHERE rol = 'VETERINARIO' AND activo ORDER BY nombre_completo, id_usuario
                """);
        String sintesis = esTutor ? "'' AS sintesis_tecnica" : "f.sintesis_tecnica";
        String filtroFichas = esTutor ? filtro + " AND f.aprobado_por_veterinario" : filtro;
        List<Map<String, Object>> fichas = puedeVerConsultas ? jdbc.queryForList("""
                SELECT f.id_ficha, f.id_consulta, f.resumen_propietario, %s,
                       f.modelo_utilizado, f.aprobado_por_veterinario,
                       to_char(f.fecha_generacion AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS fecha_generacion
                FROM fichas_ia f JOIN historiales_clinicos r ON r.id_historial = f.id_consulta
                """.formatted(sintesis) + vinculos + filtroFichas + " ORDER BY f.id_ficha DESC", parametros) : List.of();
        return new Listado(pacientes, propietarios, citas, consultas, vacunas, veterinarios, fichas);
    }

    @PatchMapping("/fichas/{id}")
    public Map<String, Boolean> aprobarFicha(@PathVariable long id, @Valid @RequestBody AprobacionFicha cambio) {
        int modificadas = jdbc.update("UPDATE fichas_ia SET aprobado_por_veterinario = ? WHERE id_ficha = ?",
                cambio.aprobada(), id);
        if (modificadas == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "La ficha no existe.");
        }
        return Map.of("aprobada", cambio.aprobada());
    }

    @PostMapping("/fichas/consulta/{id}")
    public Map<String, Long> generarFicha(@PathVariable long id) {
        var ids = jdbc.query("""
                INSERT INTO fichas_ia (id_consulta, resumen_propietario, sintesis_tecnica, modelo_utilizado)
                SELECT h.id_historial,
                    concat('Resumen de la consulta de ', p.nombre, '. Diagnóstico registrado: ', h.diagnostico,
                        CASE WHEN nullif(trim(h.tratamiento), '') IS NULL THEN ''
                             ELSE concat('. Plan registrado: ', h.tratamiento) END),
                    concat('Motivo: ', h.motivo_consulta, '. Diagnóstico: ', h.diagnostico,
                        CASE WHEN nullif(trim(h.observaciones), '') IS NULL THEN ''
                             ELSE concat('. Observaciones: ', h.observaciones) END),
                    'Resumen de consulta VetSoft'
                FROM historiales_clinicos h JOIN pacientes p ON p.id_paciente = h.id_paciente
                WHERE h.id_historial = ?
                ON CONFLICT (id_consulta) DO UPDATE SET
                    resumen_propietario = EXCLUDED.resumen_propietario,
                    sintesis_tecnica = EXCLUDED.sintesis_tecnica,
                    modelo_utilizado = EXCLUDED.modelo_utilizado, fecha_generacion = CURRENT_TIMESTAMP,
                    aprobado_por_veterinario = FALSE
                RETURNING id_ficha
                """, (fila, numero) -> fila.getLong(1), id);
        if (ids.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "La consulta no existe.");
        }
        return Map.of("idFicha", ids.getFirst());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Map<String, Long>> registrar(@Valid @RequestBody NuevoPaciente paciente) {
        long tutor = paciente.nuevoTutor() == null ? paciente.idPropietario() : vincularTutor(paciente.nuevoTutor());
        var ids = jdbc.query("""
                INSERT INTO pacientes (id_propietario, nombre, especie, raza, sexo, fecha_nacimiento,
                                       peso_kg, codigo_expediente, microchip_id)
                SELECT id_propietario, ?, ?, ?, ?, ?, ?, ?, ? FROM propietarios WHERE id_propietario = ?
                RETURNING id_paciente
                """, (fila, numero) -> fila.getLong(1), paciente.nombre().trim(), paciente.especie().trim(),
                paciente.raza(), paciente.sexo(), paciente.fechaNacimiento(), paciente.pesoKg(),
                paciente.codigoExpediente().trim(), paciente.microchipId(), tutor);
        if (ids.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona un tutor registrado.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("idPaciente", ids.getFirst()));
    }

    private long vincularTutor(NuevoTutor tutor) {
        var ids = jdbc.query("""
                INSERT INTO propietarios (id_usuario, documento_identidad, telefono, direccion)
                SELECT id_usuario, ?, ?, ? FROM usuarios WHERE lower(correo) = lower(?) AND activo
                ON CONFLICT (id_usuario) DO UPDATE SET id_usuario = EXCLUDED.id_usuario
                RETURNING id_propietario
                """, (fila, numero) -> fila.getLong(1), tutor.documento().trim(), tutor.telefono().trim(),
                tutor.direccion(), tutor.correo().trim());
        if (ids.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El tutor debe tener una cuenta activa en VetSoft.");
        }
        return ids.getFirst();
    }

    @PostMapping("/citas")
    @Transactional
    public ResponseEntity<Map<String, Long>> agendarCita(@Valid @RequestBody NuevaCita cita, Authentication usuario) {
        boolean propietario = esPropietario(usuario);
        if (!Boolean.TRUE.equals(jdbc.queryForObject("""
                SELECT EXISTS (SELECT 1 FROM pacientes p JOIN propietarios t USING (id_propietario)
                    LEFT JOIN usuarios u ON u.id_usuario = t.id_usuario
                    WHERE p.id_paciente = ? AND p.activo AND (NOT ? OR u.correo = ?))
                """, Boolean.class, cita.idPaciente(), propietario, usuario.getName()))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "La mascota seleccionada no está disponible.");
        }
        if (!Boolean.TRUE.equals(jdbc.queryForObject("""
                SELECT EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = ? AND rol = 'VETERINARIO' AND activo)
                """, Boolean.class, cita.idVeterinario()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona un veterinario activo.");
        }
        try {
            var registrada = agenda.agendarCita(cita.idPaciente(), cita.idVeterinario(), cita.fechaHora(),
                    cita.tipoCita(), cita.motivoGeneral().trim());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("idCita", registrada.getIdCita()));
        } catch (IllegalStateException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, ex.getMessage(), ex);
        }
    }

    @PatchMapping("/citas/{id}")
    public Map<String, String> cambiarEstadoCita(@PathVariable long id,
            @Valid @RequestBody CambioCita cambio, Authentication usuario) {
        boolean propietario = esPropietario(usuario);
        if (propietario && !cambio.estado().equals("CANCELADA")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo puedes cancelar tus citas.");
        }
        int actualizadas = jdbc.update("""
                UPDATE citas c SET estado = ?, version = c.version + 1
                FROM pacientes p JOIN propietarios t USING (id_propietario)
                LEFT JOIN usuarios u ON u.id_usuario = t.id_usuario
                WHERE c.id_paciente = p.id_paciente AND c.id_cita = ?
                AND (NOT ? OR u.correo = ?)
                AND (c.estado = 'PENDIENTE' OR (c.estado = 'CONFIRMADA' AND ? = 'CANCELADA'))
                """, cambio.estado(), id, propietario, usuario.getName(), cambio.estado());
        if (actualizadas == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La cita ya no está disponible para ese cambio.");
        }
        return Map.of("estado", cambio.estado());
    }

    private boolean esPropietario(Authentication usuario) {
        return usuario.getAuthorities().stream().anyMatch(rol -> rol.getAuthority().equals("ROLE_PROPIETARIO"));
    }

    @PostMapping("/consultas")
    @Transactional
    public ResponseEntity<Map<String, Long>> registrarConsulta(@Valid @RequestBody NuevaConsulta consulta) {
        var ids = jdbc.query("""
                WITH atendida AS (
                    UPDATE citas SET estado = 'ATENDIDA', version = version + 1
                    WHERE id_cita = ? AND estado IN ('PENDIENTE', 'CONFIRMADA')
                    RETURNING id_cita, id_paciente, id_veterinario
                )
                INSERT INTO historiales_clinicos (id_cita, id_paciente, id_veterinario, motivo_consulta, diagnostico,
                    tratamiento, observaciones, peso_registrado, frecuencia_cardiaca, temperatura_c)
                SELECT id_cita, id_paciente, id_veterinario, ?, ?, ?, ?, ?, ?, ? FROM atendida
                RETURNING id_historial
                """, (fila, numero) -> fila.getLong(1), consulta.idCita(), consulta.motivo(),
                consulta.diagnostico(), consulta.tratamiento(), consulta.observaciones(), consulta.pesoKg(),
                consulta.frecuenciaCardiaca(), consulta.temperatura());
        if (ids.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Selecciona una cita pendiente o confirmada.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("idConsulta", ids.getFirst()));
    }

    @PostMapping("/vacunas")
    @Transactional
    public ResponseEntity<Map<String, Long>> registrarVacuna(@Valid @RequestBody NuevaVacuna vacuna) {
        if (vacuna.fechaRefuerzo() != null && vacuna.fechaRefuerzo().isBefore(vacuna.fechaAplicacion())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La próxima dosis debe ser posterior o igual a la aplicación.");
        }
        List<Long> lotes = jdbc.query("SELECT id_lote FROM lotes_inventario WHERE codigo_lote = ?",
                (fila, numero) -> fila.getLong(1), vacuna.lote().trim());
        if (lotes.size() != 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usa un código de lote único registrado en inventario.");
        }
        var ids = jdbc.query("""
                INSERT INTO vacunas (id_paciente, id_lote, id_veterinario, nombre_vacuna,
                                     fecha_aplicacion, proxima_dosis, observaciones)
                SELECT p.id_paciente, ?, u.id_usuario, ?, ?, ?, ?
                FROM pacientes p CROSS JOIN usuarios u
                WHERE p.id_paciente = ? AND p.activo AND u.id_usuario = ? AND u.rol = 'VETERINARIO' AND u.activo
                RETURNING id_vacuna
                """, (fila, numero) -> fila.getLong(1), lotes.getFirst(), vacuna.nombre().trim(),
                vacuna.fechaAplicacion(), vacuna.fechaRefuerzo(), vacuna.observaciones(),
                vacuna.idPaciente(), vacuna.idVeterinario());
        if (ids.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona una mascota y un veterinario activos.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("idVacuna", ids.getFirst()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> estado(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("mensaje", ex.getReason()));
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<Map<String, String>> duplicado() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("mensaje", "El expediente o documento del tutor ya está en uso."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validacion() {
        return ResponseEntity.badRequest().body(Map.of("mensaje", "Revisa los datos de la mascota y del tutor."));
    }

    public record Paciente(long idMascota, long idPropietario, String expediente, String nombre, String especie,
                           String raza, String sexo, LocalDate fechaNacimiento, BigDecimal pesoKg,
                           String microchipId, boolean activo, OffsetDateTime fechaRegistro) {}
    public record Propietario(long idPropietario, Long idUsuario, String nombre, String documento,
                              String telefono, String direccion) {}
    public record Listado(List<Paciente> pacientes, List<Propietario> propietarios,
                          List<Map<String, Object>> citas, List<Map<String, Object>> consultas,
                          List<Map<String, Object>> vacunas, List<Map<String, Object>> veterinarios,
                          List<Map<String, Object>> fichas) {}
    public record AprobacionFicha(@NotNull Boolean aprobada) {}
    public record NuevoPaciente(long idPropietario, @Valid NuevoTutor nuevoTutor,
                                @NotBlank @Size(max = 120) String codigoExpediente,
                                @NotBlank @Size(max = 80) String nombre, @NotBlank @Size(max = 40) String especie,
                                @Size(max = 60) String raza, @NotNull @Pattern(regexp = "MACHO|HEMBRA") String sexo,
                                @PastOrPresent LocalDate fechaNacimiento, @NotNull @Positive @DecimalMax("999.99") BigDecimal pesoKg,
                                @Size(max = 60) String microchipId) {}
    public record NuevoTutor(@NotBlank @Email @Size(max = 150) String correo,
                             @NotBlank @Size(max = 30) String documento, @NotBlank @Size(max = 20) String telefono,
                             @Size(max = 150) String direccion) {}
    public record NuevaCita(@Positive long idPaciente, @Positive long idVeterinario,
                            @NotNull OffsetDateTime fechaHora,
                            @NotNull @Pattern(regexp = "CONSULTA|VACUNACION|CONTROL|URGENCIA") String tipoCita,
                            @NotBlank @Size(max = 250) String motivoGeneral) {}
    public record CambioCita(@NotNull @Pattern(regexp = "CONFIRMADA|CANCELADA") String estado) {}
    public record NuevaConsulta(@Positive long idCita, @NotBlank String motivo, @NotBlank String diagnostico,
                                @NotBlank String tratamiento, String observaciones,
                                @Positive @DecimalMax("999.99") BigDecimal pesoKg,
                                @Positive Integer frecuenciaCardiaca, @Positive @DecimalMax("999.99") BigDecimal temperatura) {}
    public record NuevaVacuna(@Positive long idPaciente, @Positive long idVeterinario,
                              @NotBlank @Size(max = 100) String nombre, @NotBlank @Size(max = 50) String lote,
                              @NotNull @PastOrPresent LocalDate fechaAplicacion, LocalDate fechaRefuerzo,
                              @Size(max = 255) String observaciones) {}
}
