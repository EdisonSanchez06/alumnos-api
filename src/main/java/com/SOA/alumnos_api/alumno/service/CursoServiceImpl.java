package com.SOA.alumnos_api.alumno.service;

import com.SOA.alumnos_api.alumno.dto.*;
import com.SOA.alumnos_api.alumno.entity.Alumno;
import com.SOA.alumnos_api.alumno.entity.Curso;
import com.SOA.alumnos_api.alumno.repo.AlumnoRepository;
import com.SOA.alumnos_api.alumno.repo.CursoRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CursoServiceImpl implements CursoService {

    private final CursoRepository cursoRepository;
    private final AlumnoRepository alumnoRepository;

    @Override
    public CursoResponseDTO crear(CursoCreateDTO dto) {

        Alumno alumno = alumnoRepository.findById(dto.getAlumnoCed())
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        Curso curso = Curso.builder()
                .nombre(dto.getNombre())
                .alumno(alumno)
                .build();

        return mapToDto(cursoRepository.save(curso));
    }

    @Override
    public CursoResponseDTO actualizar(Long id, CursoUpdateDTO dto) {

        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        Alumno alumno = alumnoRepository.findById(dto.getAlumnoCed())
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        curso.setNombre(dto.getNombre());
        curso.setAlumno(alumno);

        return mapToDto(cursoRepository.save(curso));
    }

    @Override
    public List<CursoResponseDTO> listar() {
        return cursoRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CursoResponseDTO> listarPorAlumno(String alumnoCed) {
        return cursoRepository.findByAlumnoEstCed(alumnoCed)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CursoResponseDTO obtener(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        return mapToDto(curso);
    }

    @Override
    public void eliminar(Long id) {
        cursoRepository.deleteById(id);
    }

    private CursoResponseDTO mapToDto(Curso curso) {
        return CursoResponseDTO.builder()
                .id(curso.getId())
                .nombre(curso.getNombre())
                .alumnoCed(curso.getAlumno().getEstCed())   // <- PARÉNTESIS CORREGIDO
                .alumnoNombreCompleto(
                        curso.getAlumno().getEstNom() + " " + curso.getAlumno().getEstApe()
                )
                .build();
    }
}
