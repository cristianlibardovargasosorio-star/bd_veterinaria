package com.vetsoft.clinic.controller;

import com.vetsoft.clinic.model.Cita;
import com.vetsoft.clinic.model.Factura;
import com.vetsoft.clinic.service.AgendaTransaccionalService;
import com.vetsoft.clinic.service.FacturacionTransaccionalService;
import com.vetsoft.clinic.service.FacturacionTransaccionalService.LineaFacturaInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Controlador clínico desacoplado (VET-RNF-06): expone exclusivamente DTOs, nunca entidades JPA.
 */
@RestController
@RequestMapping("/api/clinica")
public class OperacionClinicaController {

    private final AgendaTransaccionalService agendaService;
    private final FacturacionTransaccionalService facturacionService;

    public OperacionClinicaController(
            AgendaTransaccionalService agendaService,
            FacturacionTransaccionalService facturacionService) {
        this.agendaService = agendaService;
        this.facturacionService = facturacionService;
    }

    public record AgendarCitaRequest(
            @NotNull Long idPaciente,
            @NotNull Long idVeterinario,
            @NotNull OffsetDateTime fechaHora,
            @NotBlank String tipoCita,
            @NotBlank String motivoGeneral) {}

    public record CitaResponseDto(
            Long idCita,
            Long idPaciente,
            Long idVeterinario,
            OffsetDateTime fechaHora,
            String tipoCita,
            String estado) {}

    public record EmitirFacturaRequest(
            @NotEmpty List<LineaFacturaInput> lineas,
            boolean pagoConfirmado) {}

    public record FacturaResponseDto(
            Long idFactura,
            BigDecimal total,
            String estado,
            int cantidadLineas) {}

    @PostMapping("/citas")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA')")
    public CitaResponseDto agendarCita(@Valid @RequestBody AgendarCitaRequest req) {
        Cita cita = agendaService.agendarCita(
                req.idPaciente(), req.idVeterinario(), req.fechaHora(), req.tipoCita(), req.motivoGeneral());
        return new CitaResponseDto(
                cita.getIdCita(),
                cita.getIdPaciente(),
                cita.getVeterinario().getIdUsuario(),
                cita.getFechaHora(),
                cita.getTipoCita(),
                cita.getEstado());
    }

    @PostMapping("/facturas")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA')")
    public FacturaResponseDto emitirFactura(@Valid @RequestBody EmitirFacturaRequest req) {
        Factura factura = facturacionService.emitirFacturaConDescuento(req.lineas(), req.pagoConfirmado());
        return new FacturaResponseDto(
                factura.getIdFactura(),
                factura.getTotal(),
                factura.getEstado(),
                factura.getDetalles().size());
    }
}
