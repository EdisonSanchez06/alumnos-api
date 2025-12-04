package com.SOA.alumnos_api.alumno.service;

import com.SOA.alumnos_api.alumno.dto.CursoCreateDTO;
import com.SOA.alumnos_api.alumno.dto.CursoUpdateDTO;
import com.SOA.alumnos_api.alumno.dto.CursoResponseDTO;

import java.util.List;

public interface CursoService {

    CursoResponseDTO crear(CursoCreateDTO dto);

    CursoResponseDTO actualizar(Long id, CursoUpdateDTO dto);

    List<CursoResponseDTO> listar();

    List<CursoResponseDTO> listarPorAlumno(String alumnoCed);

    CursoResponseDTO obtener(Long id);

    void eliminar(Long id);
}
