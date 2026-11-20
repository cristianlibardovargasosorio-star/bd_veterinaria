package com.vetsoft.clinic.repository;

import com.vetsoft.clinic.model.LoteInventario;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface LoteInventarioRepository extends JpaRepository<LoteInventario, Long> {

    /**
     * Bloqueo pesimista exclusivo en el punto de contención real de descuento FEFO
     * para evitar sobreventa simultánea sobre el mismo lote.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT l FROM LoteInventario l
            JOIN FETCH l.producto p
            WHERE p.idProducto = :idProducto
              AND l.cantidadDisponible > 0
              AND l.fechaVencimiento > :hoy
            ORDER BY l.fechaVencimiento ASC, l.fechaIngreso ASC, l.idLote ASC
            """)
    List<LoteInventario> findLotesConsumiblesParaDescuento(
            @Param("idProducto") Long idProducto,
            @Param("hoy") LocalDate hoy);
}
