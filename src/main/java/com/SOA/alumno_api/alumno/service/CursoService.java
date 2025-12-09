package com.soa.alumno_api.alumno.service;

import com.soa.alumno_api.alumno.dto.CursoCreateDTO;
import com.soa.alumno_api.alumno.dto.CursoUpdateDTO;
import com.soa.alumno_api.alumno.entity.Curso;

import java.util.List;
public interface CursoService {

    List<Curso> listar();
    Curso buscarPorId(Long id);
    Curso crear(CursoCreateDTO dto);
    Curso actualizar(Long id, CursoUpdateDTO dto);
    void eliminar(Long id);
}

