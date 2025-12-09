package com.soa.alumno_api.alumno.repo;

import com.soa.alumno_api.alumno.entity.Alumno;
import com.soa.alumno_api.alumno.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlumnoRepository extends JpaRepository<Alumno, String> {

    // Buscar alumno por cédula (ya lo usas)
    boolean existsByEstCed(String estCed);

    // NUEVO (para asignación 1 curso : N alumnos)
    List<Alumno> findByCurso(Curso curso);

    // Útil para consultas por ID del curso
    List<Alumno> findByCurso_Id(Long cursoId);
}
