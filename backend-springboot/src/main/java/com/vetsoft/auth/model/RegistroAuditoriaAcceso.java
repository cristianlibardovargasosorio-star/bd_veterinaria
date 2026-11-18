package com.vetsoft.auth.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/**
 * Entidad de auditoría de accesos y altas vinculada a Usuario con FetchType.LAZY
 * para evitar cargas ansiosas (EAGER) innecesarias en consultas de usuarios.
 */
@Entity
@Table(name = "auditoria_accesos")
public class RegistroAuditoriaAcceso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_auditoria")
    private Long idAuditoria;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false, foreignKey = @ForeignKey(name = "fk_auditoria_usuario"))
    private Usuario usuario;

    @Column(name = "evento", nullable = false, length = 80)
    private String evento;

    @Column(name = "fecha_evento", nullable = false, updatable = false)
    private OffsetDateTime fechaEvento = OffsetDateTime.now();

    public RegistroAuditoriaAcceso() {
    }

    public RegistroAuditoriaAcceso(Usuario usuario, String evento) {
        this.usuario = usuario;
        this.evento = evento;
    }

    public Long getIdAuditoria() {
        return idAuditoria;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getEvento() {
        return evento;
    }

    public void setEvento(String evento) {
        this.evento = evento;
    }

    public OffsetDateTime getFechaEvento() {
        return fechaEvento;
    }
}
