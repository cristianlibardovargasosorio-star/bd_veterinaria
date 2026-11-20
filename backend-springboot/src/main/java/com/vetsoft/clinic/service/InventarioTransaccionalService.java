package com.vetsoft.clinic.service;

import com.vetsoft.clinic.model.LoteInventario;
import com.vetsoft.clinic.model.MovimientoInventario;
import com.vetsoft.clinic.repository.LoteInventarioRepository;
import com.vetsoft.clinic.repository.MovimientoInventarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class InventarioTransaccionalService {

    private final LoteInventarioRepository loteRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    public InventarioTransaccionalService(
            LoteInventarioRepository loteRepository,
            MovimientoInventarioRepository movimientoRepository) {
        this.loteRepository = loteRepository;
        this.movimientoRepository = movimientoRepository;
    }

    /**
     * Descuenta stock en orden FEFO bajo bloqueo pesimista + @Version y registra MovimientoInventario
     * en la misma transacción ACID (sin movimientos huérfanos ni saldos parciales ante fallo).
     */
    @Transactional(rollbackFor = Exception.class)
    public void descontarStockPorLote(Long idProducto, int cantidadRequerida, String motivo) {
        if (cantidadRequerida <= 0) {
            throw new IllegalArgumentException("La cantidad a descontar debe ser mayor a cero");
        }

        List<LoteInventario> lotes = loteRepository.findLotesConsumiblesParaDescuento(idProducto, LocalDate.now());
        int pendiente = cantidadRequerida;

        for (LoteInventario lote : lotes) {
            if (pendiente == 0) break;
            int descuento = Math.min(lote.getCantidadDisponible(), pendiente);
            lote.setCantidadDisponible(lote.getCantidadDisponible() - descuento);
            pendiente -= descuento;

            MovimientoInventario mov = new MovimientoInventario();
            mov.setLote(lote);
            mov.setTipo("SALIDA");
            mov.setCantidad(descuento);
            mov.setMotivo(motivo);
            movimientoRepository.save(mov);
        }

        if (pendiente > 0) {
            throw new IllegalStateException("Stock vendible insuficiente en lotes vigentes para el producto " + idProducto);
        }
    }
}
