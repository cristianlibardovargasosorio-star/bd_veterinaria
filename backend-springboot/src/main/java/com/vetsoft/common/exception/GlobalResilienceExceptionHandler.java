package com.vetsoft.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Manejador global de resiliencia y errores controlados (VET-RNF-05).
 * Garantiza formato JSON uniforme sin filtrar SQL, nombres de tablas ni datos sensibles.
 */
@RestControllerAdvice
@Order(Ordered.LOWEST_PRECEDENCE)
public class GlobalResilienceExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalResilienceExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError err : ex.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(err.getField(), err.getDefaultMessage());
        }
        log.warn("Error de validación en {}: {} campo(s) inválido(s)", request.getRequestURI(), campos.size());
        return ResponseEntity.badRequest().body(
                ApiErrorResponse.conCampos("VALIDACION_INVALIDA", "Revise los datos ingresados.", request.getRequestURI(), campos));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {
        Map<String, String> campos = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(v ->
                campos.putIfAbsent(v.getPropertyPath().toString(), v.getMessage()));
        log.warn("Violación de restricción en {}", request.getRequestURI());
        return ResponseEntity.badRequest().body(
                ApiErrorResponse.conCampos("RESTRICCION_INCUMPLIDA", "Parámetros de solicitud inválidos.", request.getRequestURI(), campos));
    }

    @ExceptionHandler(VetSoftDomainException.class)
    public ResponseEntity<ApiErrorResponse> handleDomain(
            VetSoftDomainException ex, HttpServletRequest request) {
        log.warn("Error de negocio [{}] en {}: {}", ex.getCodigo(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(ex.getStatus()).body(
                ApiErrorResponse.of(ex.getCodigo(), ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthentication(
            AuthenticationException ex, HttpServletRequest request) {
        log.warn("Fallo de autenticación en {}", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ApiErrorResponse.of("NO_AUTENTICADO", "Credenciales inválidas o sesión expirada.", request.getRequestURI()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        log.warn("Acceso denegado (403) en {}", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                ApiErrorResponse.of("ACCESO_DENEGADO", "No cuenta con permisos para realizar esta acción.", request.getRequestURI()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrity(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        log.error("Conflicto de integridad en base de datos para {}", request.getRequestURI(), ex);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiErrorResponse.of("CONFLICTO_DATOS", "La operación entra en conflicto con los datos actuales.", request.getRequestURI()));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiErrorResponse> handleDatabaseError(
            DataAccessException ex, HttpServletRequest request) {
        log.error("Error de acceso a base de datos en {}", request.getRequestURI(), ex);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                ApiErrorResponse.of("SERVICIO_NO_DISPONIBLE", "Servicio temporalmente no disponible. Intente nuevamente.", request.getRequestURI()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(
            Exception ex, HttpServletRequest request) {
        log.error("Error inesperado controlado en {}", request.getRequestURI(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiErrorResponse.of("ERROR_INTERNO", "Ocurrió un error inesperado. Contacte al soporte técnico.", request.getRequestURI()));
    }
}
