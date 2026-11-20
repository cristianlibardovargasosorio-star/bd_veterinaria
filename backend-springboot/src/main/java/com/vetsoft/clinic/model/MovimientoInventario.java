package com.vetsoft.clinic.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "movimientos_inventario")
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento")
    private Long idMovimiento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_lote", nullable = false)
    private LoteInventario lote;

    @Column(nullable = false, length = 20)
    private String tipo;

    @Column(nullable = false)
    private int cantidad;

    @Column(nullable = false, length = 180)
    private String motivo;

    @Column(name = "fecha_movimiento", nullable = false)
    private OffsetDateTime fechaMovimiento = OffsetDateTime.now();

    public Long getIdMovimiento() { return idMovimiento; }
    public LoteInventario getLote() { return lote; }
    public void setLote(LoteInventario lote) { this.lote = lote; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public int getCantidad() { return cantidad; }
    public void setCantidad(int cantidad) { this.cantidad = cantidad; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
}
