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
import java.time.OffsetDateTime;
import java.util.List;

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

    public record EmitirFacturaRequest(
            @NotEmpty List<LineaFacturaInput> lineas,
            boolean pagoConfirmado) {}

    @PostMapping("/citas")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA')")
    public Cita agendarCita(@Valid @RequestBody AgendarCitaRequest req) {
        return agendaService.agendarCita(
                req.idPaciente(), req.idVeterinario(), req.fechaHora(), req.tipoCita(), req.motivoGeneral());
    }

    @PostMapping("/facturas")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA')")
    public Factura emitirFactura(@Valid @RequestBody EmitirFacturaRequest req) {
        return facturacionService.emitirFacturaConDescuento(req.lineas(), req.pagoConfirmado());
    }
}
