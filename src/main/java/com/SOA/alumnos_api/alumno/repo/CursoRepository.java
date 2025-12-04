package com.SOA.alumnos_api.alumno.repo;

import com.SOA.alumnos_api.alumno.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {

    List<Curso> findByAlumnoEstCed(String estCed);
}
