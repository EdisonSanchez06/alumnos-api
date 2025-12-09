package com.soa.alumno_api.alumno.repo;

import com.soa.alumno_api.alumno.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CursoRepository extends JpaRepository<Curso, Long> {

    boolean existsByNombreIgnoreCase(String nombre);
}
