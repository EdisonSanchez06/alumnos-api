package com.soa.alumno_api.alumno.service;

import com.soa.alumno_api.alumno.dto.CursoCreateDTO;
import com.soa.alumno_api.alumno.dto.CursoUpdateDTO;
import com.soa.alumno_api.alumno.dto.CursoResponseDTO;

import java.util.List;

public interface CursoService {

    CursoResponseDTO crear(CursoCreateDTO dto);

    CursoResponseDTO actualizar(Long id, CursoUpdateDTO dto);

    List<CursoResponseDTO> listar();

    List<CursoResponseDTO> listarPorAlumno(String alumnoCed);

    CursoResponseDTO obtener(Long id);

    void eliminar(Long id);
}
