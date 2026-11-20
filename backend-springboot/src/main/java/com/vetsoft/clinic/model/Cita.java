package com.vetsoft.clinic.model;

import com.vetsoft.auth.model.Usuario;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "citas")
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cita")
    private Long idCita;

    @Column(name = "id_paciente", nullable = false)
    private Long idPaciente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_veterinario", nullable = false)
    private Usuario veterinario;

    @Column(name = "fecha_hora", nullable = false)
    private OffsetDateTime fechaHora;

    @Column(name = "tipo_cita", nullable = false, length = 40)
    private String tipoCita;

    @Column(name = "motivo_general", nullable = false, length = 250)
    private String motivoGeneral;

    @Column(nullable = false, length = 20)
    private String estado = "PENDIENTE";

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    public Long getIdCita() { return idCita; }
    public Long getIdPaciente() { return idPaciente; }
    public void setIdPaciente(Long idPaciente) { this.idPaciente = idPaciente; }
    public Usuario getVeterinario() { return veterinario; }
    public void setVeterinario(Usuario veterinario) { this.veterinario = veterinario; }
    public OffsetDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(OffsetDateTime fechaHora) { this.fechaHora = fechaHora; }
    public String getTipoCita() { return tipoCita; }
    public void setTipoCita(String tipoCita) { this.tipoCita = tipoCita; }
    public String getMotivoGeneral() { return motivoGeneral; }
    public void setMotivoGeneral(String motivoGeneral) { this.motivoGeneral = motivoGeneral; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public Long getVersion() { return version; }
}
