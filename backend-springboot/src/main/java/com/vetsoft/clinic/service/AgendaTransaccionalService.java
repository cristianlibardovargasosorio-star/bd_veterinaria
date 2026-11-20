package com.vetsoft.clinic.service;

import com.vetsoft.auth.model.Usuario;
import com.vetsoft.auth.repository.UsuarioRepository;
import com.vetsoft.clinic.model.Cita;
import com.vetsoft.clinic.repository.CitaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;

@Service
public class AgendaTransaccionalService {

    private final CitaRepository citaRepository;
    private final UsuarioRepository usuarioRepository;

    public AgendaTransaccionalService(CitaRepository citaRepository, UsuarioRepository usuarioRepository) {
        this.citaRepository = citaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Invocado externamente vía proxy Spring para garantizar transaccionalidad ACID.
     * Previene citas huérfanas y dobles reservas junto con @Version + índice único parcial en PostgreSQL.
     */
    @Transactional(rollbackFor = Exception.class)
    public Cita agendarCita(Long idPaciente, Long idVeterinario, OffsetDateTime fechaHora, String tipoCita, String motivo) {
        if (idPaciente == null || idVeterinario == null || fechaHora == null) {
            throw new IllegalArgumentException("Paciente, veterinario y fecha son obligatorios");
        }
        Usuario veterinario = usuarioRepository.findById(idVeterinario)
                .orElseThrow(() -> new EntityNotFoundException("Veterinario no encontrado"));

        if (citaRepository.existsByVeterinarioIdUsuarioAndFechaHoraAndEstadoNot(idVeterinario, fechaHora, "CANCELADA")) {
            throw new IllegalStateException("El veterinario ya tiene una cita reservada en esa franja horaria");
        }

        Cita cita = new Cita();
        cita.setIdPaciente(idPaciente);
        cita.setVeterinario(veterinario);
        cita.setFechaHora(fechaHora);
        cita.setTipoCita(tipoCita);
        cita.setMotivoGeneral(motivo);
        cita.setEstado("PENDIENTE");
        return citaRepository.save(cita);
    }
}
