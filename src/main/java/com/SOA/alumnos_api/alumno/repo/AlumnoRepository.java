package com.SOA.alumnos_api.alumno.repo;

import com.SOA.alumnos_api.alumno.entity.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlumnoRepository extends JpaRepository<Alumno, String> {
    boolean existsByEstCed(String estCed);
}