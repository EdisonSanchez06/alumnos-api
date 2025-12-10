package com.soa.alumno_api.alumno.service;

import com.soa.alumno_api.alumno.dto.*;

import java.util.List;

public interface CursoService {

    List<CursoResponseDTO> listar();
    CursoResponseDTO buscar(Long id);
    CursoResponseDTO crear(CursoCreateDTO dto);
    CursoResponseDTO actualizar(Long id, CursoUpdateDTO dto);
    void eliminar(Long id);

    List<?> listarEstudiantes(Long cursoId);
}
