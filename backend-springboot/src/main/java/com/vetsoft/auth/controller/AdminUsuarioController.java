package com.vetsoft.auth.controller;

import com.vetsoft.auth.dto.RegistroUsuarioRequestDto;
import com.vetsoft.auth.dto.UsuarioResponseDto;
import com.vetsoft.auth.exception.CorreoDuplicadoException;
import com.vetsoft.auth.service.AdminUsuarioService;
import jakarta.validation.Valid;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint de administración para registro y consulta de personal interno (VET-RF-01).
 * Ruta protegida por Spring Security (.requestMatchers("/admin/**").hasRole("ADMINISTRADOR")).
 */
@RestController
@RequestMapping("/admin/usuarios")
public class AdminUsuarioController {

    private final AdminUsuarioService adminUsuarioService;

    public AdminUsuarioController(AdminUsuarioService adminUsuarioService) {
        this.adminUsuarioService = adminUsuarioService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDto> registrarUsuario(
            @Valid @RequestBody RegistroUsuarioRequestDto request
    ) {
        UsuarioResponseDto creado = adminUsuarioService.registrarUsuarioInterno(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @GetMapping
    public ResponseEntity<Page<UsuarioResponseDto>> listarUsuarios(
            @PageableDefault(size = 10, sort = "idUsuario") Pageable pageable
    ) {
        return ResponseEntity.ok(adminUsuarioService.listarUsuariosPaginados(pageable));
    }

    @ExceptionHandler(CorreoDuplicadoException.class)
    public ResponseEntity<Map<String, Object>> manejarCorreoDuplicado(CorreoDuplicadoException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error", "CORREO_DUPLICADO",
                "mensaje", ex.getMessage()
        ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> erroresCampos = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            erroresCampos.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }
        String primerMensaje = erroresCampos.values().stream().findFirst().orElse("Datos de registro inválidos");
        return ResponseEntity.badRequest().body(Map.of(
                "error", "VALIDACION_FALLIDA",
                "mensaje", primerMensaje,
                "campos", erroresCampos
        ));
    }

    @ExceptionHandler({IllegalArgumentException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<Map<String, Object>> manejarEntradaInvalida(Exception ex) {
        return ResponseEntity.badRequest().body(Map.of(
                "error", "ENTRADA_INVALIDA",
                "mensaje", "El rol o los datos enviados no son válidos"
        ));
    }
}

