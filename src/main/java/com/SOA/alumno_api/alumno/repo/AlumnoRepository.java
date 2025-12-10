package com.soa.alumno_api.alumno.repo;

import com.soa.alumno_api.alumno.entity.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlumnoRepository extends JpaRepository<Alumno, String> {

    List<Alumno> findByCurso_Id(Long cursoId);
}
