package com.vetsoft.clinic.repository;

import com.vetsoft.clinic.model.Factura;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FacturaRepository extends JpaRepository<Factura, Long> {

    @EntityGraph(attributePaths = {"detalles", "detalles.producto"})
    Optional<Factura> findWithDetallesByIdFactura(Long idFactura);
}
