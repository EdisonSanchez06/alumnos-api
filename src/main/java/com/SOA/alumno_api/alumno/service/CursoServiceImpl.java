package com.soa.alumno_api.alumno.service.impl;

import com.soa.alumno_api.alumno.dto.*;
import com.soa.alumno_api.alumno.entity.Curso;
import com.soa.alumno_api.alumno.repo.AlumnoRepository;
import com.soa.alumno_api.alumno.repo.CursoRepository;
import com.soa.alumno_api.alumno.service.CursoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service @RequiredArgsConstructor
public class CursoServiceImpl implements CursoService {

    private final CursoRepository repo;
    private final AlumnoRepository alumnoRepo;

    @Override
    public List<CursoResponseDTO> listar() {
        return repo.findAll().stream()
                .map(c -> new CursoResponseDTO(
                        c.getId(),
                        c.getNombre(),
                        c.getNivel(),
                        c.getParalelo(),
                        c.getAlumnos().size()
                )).toList();
    }

    @Override
    public CursoResponseDTO buscar(Long id) {
        Curso c = repo.findById(id).orElseThrow();
        return new CursoResponseDTO(
                c.getId(), c.getNombre(), c.getNivel(), c.getParalelo(), c.getAlumnos().size()
        );
    }

    @Override
    public CursoResponseDTO crear(CursoCreateDTO dto) {
        Curso c = repo.save(
                Curso.builder()
                        .nombre(dto.getNombre())
                        .nivel(dto.getNivel())
                        .paralelo(dto.getParalelo())
                        .build()
        );
        return buscar(c.getId());
    }

    @Override
    public CursoResponseDTO actualizar(Long id, CursoUpdateDTO dto) {
        Curso c = repo.findById(id).orElseThrow();
        c.setNombre(dto.getNombre());
        c.setNivel(dto.getNivel());
        c.setParalelo(dto.getParalelo());
        repo.save(c);
        return buscar(id);
    }

    @Override
    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    @Override
    public List<?> listarEstudiantes(Long cursoId) {
        return alumnoRepo.findByCurso_Id(cursoId);
    }
}
