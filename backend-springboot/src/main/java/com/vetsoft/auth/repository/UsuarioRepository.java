package com.vetsoft.auth.repository;

import com.vetsoft.auth.model.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio de acceso a datos en PostgreSQL para la entidad Usuario.
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Busca un usuario por correo electrónico ignorando mayúsculas/minúsculas.
     *
     * @param correo Correo electrónico del usuario
     * @return Optional con el usuario encontrado o vacío
     */
    Optional<Usuario> findByCorreoIgnoreCase(String correo);

    /**
     * Verifica si ya existe un usuario registrado con el correo indicado.
     *
     * @param correo Correo electrónico a verificar
     * @return true si el correo ya está registrado
     */
    boolean existsByCorreoIgnoreCase(String correo);
}

