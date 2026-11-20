package com.vetsoft.clinic.service;

import com.vetsoft.clinic.model.*;
import com.vetsoft.clinic.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
public class FacturacionTransaccionalService {

    public record LineaFacturaInput(Long idProducto, int cantidad) {}

    private final FacturaRepository facturaRepository;
    private final ProductoRepository productoRepository;
    private final InventarioTransaccionalService inventarioService;

    public FacturacionTransaccionalService(
            FacturaRepository facturaRepository,
            ProductoRepository productoRepository,
            InventarioTransaccionalService inventarioService) {
        this.facturaRepository = facturaRepository;
        this.productoRepository = productoRepository;
        this.inventarioService = inventarioService;
    }

    /**
     * Crea cabecera Factura + DetalleFactura y descuenta inventario vía bean proxy inyectado.
     * Cualquier fallo (stock insuficiente, producto inexistente o fallo de cobro) revierte toda la operación.
     */
    @Transactional(rollbackFor = Exception.class)
    public Factura emitirFacturaConDescuento(List<LineaFacturaInput> lineas, boolean pagoConfirmado) {
        if (lineas == null || lineas.isEmpty()) {
            throw new IllegalArgumentException("La factura debe contener al menos una línea");
        }
        if (!pagoConfirmado) {
            throw new IllegalStateException("No se puede emitir una factura pagada sin cobro registrado");
        }

        Factura factura = new Factura();
        factura.setEstado("PAGADA");
        BigDecimal total = BigDecimal.ZERO;

        for (LineaFacturaInput item : lineas) {
            Producto producto = productoRepository.findById(item.idProducto())
                    .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + item.idProducto()));

            // Invocación a través del proxy Spring (otra clase de servicio)
            inventarioService.descontarStockPorLote(
                    producto.getIdProducto(), item.cantidad(), "Venta POS SKU " + producto.getSku());

            BigDecimal subtotal = producto.getPrecioUnitario().multiply(BigDecimal.valueOf(item.cantidad()));
            DetalleFactura detalle = new DetalleFactura();
            detalle.setProducto(producto);
            detalle.setCantidad(item.cantidad());
            detalle.setSubtotal(subtotal);
            factura.agregarDetalle(detalle);
            total = total.add(subtotal);
        }

        factura.setTotal(total);
        return facturaRepository.save(factura);
    }
}
