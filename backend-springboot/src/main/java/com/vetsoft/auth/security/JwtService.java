package com.vetsoft.auth.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vetsoft.auth.model.RolUsuario;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Servicio de generación y validación de tokens JWT (HS256) para VET-RF-02.
 */
@Service
public class JwtService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final byte[] secretBytes;
    private final long expirationMs;

    public JwtService(
            @Value("${vetsoft.jwt.secret:VetSoftJwtSecretKey2026ParaFirmaHS256VeterinariaSegura!}") String secret,
            @Value("${vetsoft.jwt.expiration-ms:3600000}") long expirationMs
    ) {
        this.secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationMs = expirationMs;
    }

    public String generateToken(String correo, RolUsuario rol) {
        try {
            long nowSec = Instant.now().getEpochSecond();
            long expSec = nowSec + Math.max(1L, expirationMs / 1000L);

            Map<String, Object> header = Map.of("alg", "HS256", "typ", "JWT");
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("sub", correo);
            payload.put("rol", rol.name());
            payload.put("iat", nowSec);
            payload.put("exp", expSec);

            String headerB64 = base64UrlEncode(objectMapper.writeValueAsBytes(header));
            String payloadB64 = base64UrlEncode(objectMapper.writeValueAsBytes(payload));
            String signingInput = headerB64 + "." + payloadB64;
            String signatureB64 = sign(signingInput);

            return signingInput + "." + signatureB64;
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo generar el token JWT", ex);
        }
    }

    public Map<String, Object> validateAndExtractClaims(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token JWT vacío");
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Formato de token JWT inválido");
        }

        String signingInput = parts[0] + "." + parts[1];
        String expectedSig = sign(signingInput);
        if (!MessageDigest.isEqual(
                expectedSig.getBytes(StandardCharsets.UTF_8),
                parts[2].getBytes(StandardCharsets.UTF_8)
        )) {
            throw new IllegalArgumentException("Firma JWT inválida");
        }

        try {
            byte[] decodedPayload = Base64.getUrlDecoder().decode(parts[1]);
            Map<String, Object> claims = objectMapper.readValue(
                    decodedPayload,
                    new TypeReference<Map<String, Object>>() {}
            );

            Object expObj = claims.get("exp");
            if (!(expObj instanceof Number expNum)) {
                throw new IllegalArgumentException("Token sin expiración");
            }
            if (Instant.now().getEpochSecond() >= expNum.longValue()) {
                throw new IllegalArgumentException("Token JWT expirado");
            }
            return claims;
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalArgumentException("No se pudo decodificar el token JWT", ex);
        }
    }

    public String extractCorreo(String token) {
        Object sub = validateAndExtractClaims(token).get("sub");
        return sub != null ? sub.toString() : null;
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secretBytes, HMAC_ALGORITHM));
            byte[] rawSig = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return base64UrlEncode(rawSig);
        } catch (Exception ex) {
            throw new IllegalStateException("Error firmando JWT con HS256", ex);
        }
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
