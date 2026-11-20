package com.vetsoft.clinic.exception;

import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.OptimisticLockException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Manejador global de concurrencia y transaccionalidad (VET-RNF-04).
 * Traduce colisiones optimistas/pesimistas y restricciones únicas a HTTP 409 Conflict (nunca HTTP 500).
 */
@RestControllerAdvice
public class GlobalConcurrencyExceptionHandler {

    @ExceptionHandler({OptimisticLockException.class, ObjectOptimisticLockingFailureException.class})
    public ProblemDetail handleOptimisticConflict() {
        return ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT,
                "Otro usuario modificó este registro al mismo tiempo. Por favor recarga e intenta nuevamente.");
    }

    @ExceptionHandler(PessimisticLockingFailureException.class)
    public ProblemDetail handlePessimisticConflict() {
        return ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT,
                "El lote se encuentra bloqueado por una operación simultánea. Intenta de nuevo en unos segundos.");
    }

    @ExceptionHandler({DataIntegrityViolationException.class, IllegalStateException.class})
    public ProblemDetail handleDomainOrUniqueConflict(RuntimeException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ProblemDetail handleNotFound(EntityNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleBadRequest(IllegalArgumentException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }
}
