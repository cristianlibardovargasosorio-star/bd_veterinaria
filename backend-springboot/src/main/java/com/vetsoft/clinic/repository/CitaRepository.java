package com.vetsoft.clinic.repository;

import com.vetsoft.clinic.model.Cita;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.OffsetDateTime;

public interface CitaRepository extends JpaRepository<Cita, Long> {

    boolean existsByVeterinarioIdUsuarioAndFechaHoraAndEstadoNot(
            Long idVeterinario, OffsetDateTime fechaHora, String estadoExcluido);

    @EntityGraph(attributePaths = {"veterinario"})
    Page<Cita> findByFechaHoraBetweenOrderByFechaHoraAsc(
            OffsetDateTime inicio, OffsetDateTime fin, Pageable pageable);
}
