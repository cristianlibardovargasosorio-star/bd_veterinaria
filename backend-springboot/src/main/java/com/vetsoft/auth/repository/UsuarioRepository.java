package com.vetsoft.auth.repository;

import com.vetsoft.auth.model.Usuario;
import java.util.Optional;
import java.util.List;
import com.vetsoft.auth.model.RolUsuario;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * Consulta paginada de usuarios bajo demanda para evitar cargar tablas completas.
     */
    Page<Usuario> findAllByOrderByIdUsuarioDesc(Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    List<Usuario> findAllByRolAndActivoTrueOrderByIdUsuario(RolUsuario rol);

    @Modifying
    @Query(value = """
            INSERT INTO auditoria_accesos (id_usuario, evento)
            SELECT id_usuario, :evento FROM usuarios WHERE correo = :correo
            """, nativeQuery = true)
    void registrarCambioDeAcceso(@Param("correo") String correo, @Param("evento") String evento);
}

