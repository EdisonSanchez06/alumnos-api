package com.soa.alumno_api.alumno.repo;

import com.soa.alumno_api.alumno.entity.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlumnoRepository extends JpaRepository<Alumno, String> {

    boolean existsByEstCed(String estCed);

    // Todos los alumnos que están matriculados en un curso (por id de curso)
    @Query("SELECT a FROM Alumno a JOIN a.cursos c WHERE c.id = :cursoId")
    List<Alumno> findByCursoId(@Param("cursoId") Long cursoId);
}
