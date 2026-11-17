package com.vetsoft.auth.exception;

/**
 * Excepción de negocio lanzada cuando se intenta registrar un correo ya existente.
 */
public class CorreoDuplicadoException extends RuntimeException {

    public static final String MENSAJE_EXACTO = "Este correo ya está registrado";

    public CorreoDuplicadoException() {
        super(MENSAJE_EXACTO);
    }
}
