package com.soa.alumno_api.alumno.repo;

import com.soa.alumno_api.alumno.entity.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AlumnoRepository extends JpaRepository<Alumno, String> {

    boolean existsByEstCed(String estCed);


    @Query("SELECT a FROM Alumno a WHERE a.curso.id = :cursoId")
    List<Alumno> findByCursoId(Long cursoId);
}
