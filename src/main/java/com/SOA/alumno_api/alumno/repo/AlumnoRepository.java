package com.soa.alumno_api.alumno.repo;

import com.soa.alumno_api.alumno.entity.Alumno;
import com.soa.alumno_api.alumno.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlumnoRepository extends JpaRepository<Alumno, String> {

    boolean existsByEstCed(String estCed);

    List<Alumno> findByCurso(Curso curso);

    long countByCurso(Curso curso);
}
