package com.vetsoft.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Formato JSON estandarizado para respuestas de error en VetSoft (VET-RNF-05).
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiErrorResponse(
        String codigo,
        String mensaje,
        OffsetDateTime timestamp,
        String ruta,
        Map<String, String> erroresCampo
) {
    public static ApiErrorResponse of(String codigo, String mensaje, String ruta) {
        return new ApiErrorResponse(codigo, mensaje, OffsetDateTime.now(), ruta, null);
    }

    public static ApiErrorResponse conCampos(
            String codigo, String mensaje, String ruta, Map<String, String> erroresCampo) {
        return new ApiErrorResponse(codigo, mensaje, OffsetDateTime.now(), ruta, erroresCampo);
    }
}
