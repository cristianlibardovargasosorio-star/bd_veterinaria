package com.vetsoft.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Excepción base de dominio de VetSoft con código de error controlado y estado HTTP explícito.
 */
public class VetSoftDomainException extends RuntimeException {

    private final String codigo;
    private final HttpStatus status;

    public VetSoftDomainException(String codigo, String message, HttpStatus status) {
        super(message);
        this.codigo = codigo;
        this.status = status;
    }

    public String getCodigo() {
        return codigo;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
