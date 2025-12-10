package com.soa.alumno_api.alumno.service;

import com.soa.alumno_api.alumno.dto.AlumnoCreateDto;
import com.soa.alumno_api.alumno.dto.AlumnoUpdateDto;
import com.soa.alumno_api.alumno.entity.Alumno;
import com.soa.alumno_api.alumno.entity.Curso;

import java.util.List;

public interface AlumnoService {

    // CRUD básico
    List<Alumno> listar();

    Alumno buscarPorCedula(String cedula);

    Alumno crear(AlumnoCreateDto dto);

    Alumno actualizar(String cedula, AlumnoUpdateDto dto);

    void eliminar(String cedula);

    // 🔹 Asignar un estudiante a un curso
    Alumno asignarCurso(String cedula, Long cursoId);

    // 🔹 Obtener el curso al que pertenece un estudiante
    Curso obtenerCursoDeAlumno(String cedula);
}
