package com.vetsoft.clinic.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "facturas")
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_factura")
    private Long idFactura;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cita")
    private Cita cita;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String estado = "PAGADA";

    @Column(name = "fecha_emision", nullable = false)
    private OffsetDateTime fechaEmision = OffsetDateTime.now();

    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DetalleFactura> detalles = new ArrayList<>();

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    public void agregarDetalle(DetalleFactura detalle) {
        detalle.setFactura(this);
        this.detalles.add(detalle);
    }

    public Long getIdFactura() { return idFactura; }
    public Cita getCita() { return cita; }
    public void setCita(Cita cita) { this.cita = cita; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public List<DetalleFactura> getDetalles() { return detalles; }
    public Long getVersion() { return version; }
}
