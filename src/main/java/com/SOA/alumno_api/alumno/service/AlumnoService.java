package com.soa.alumno_api.alumno.service;

import com.soa.alumno_api.alumno.dto.AlumnoCreateDto;
import com.soa.alumno_api.alumno.dto.AlumnoUpdateDto;
import com.soa.alumno_api.alumno.entity.Alumno;
import com.soa.alumno_api.alumno.entity.Curso;

import java.util.List;
public interface AlumnoService {

    List<Alumno> listar();
    Alumno buscarPorCedula(String cedula);
    Alumno crear(AlumnoCreateDto dto);
    Alumno actualizar(String cedula, AlumnoUpdateDto dto);
    void eliminar(String cedula);

    Alumno asignarCurso(String cedula, Long cursoId);
    List<Alumno> obtenerAlumnosPorCurso(Long cursoId);
    Curso obtenerCursoDeAlumno(String cedula);
}
