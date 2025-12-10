package com.soa.alumno_api.alumno.repo;

import com.soa.alumno_api.alumno.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CursoRepository extends JpaRepository<Curso, Long> {

    boolean existsByNombreIgnoreCaseAndNivelIgnoreCaseAndParaleloIgnoreCase(
            String nombre, String nivel, String paralelo
    );

    boolean existsByNombreIgnoreCaseAndNivelIgnoreCaseAndParaleloIgnoreCaseAndIdNot(
            String nombre, String nivel, String paralelo, Long id
    );
}

