package com.vetsoft.clinic.repository;

import com.vetsoft.clinic.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
