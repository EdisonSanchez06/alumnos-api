package com.soa.alumno_api.alumno.service;

import com.soa.alumno_api.alumno.dto.AlumnoCreateDto;
import com.soa.alumno_api.alumno.dto.AlumnoUpdateDto;
import com.soa.alumno_api.alumno.entity.Alumno;
import com.soa.alumno_api.alumno.entity.Curso;
import com.soa.alumno_api.alumno.repo.AlumnoRepository;
import com.soa.alumno_api.alumno.repo.CursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Service
@RequiredArgsConstructor
public class AlumnoServiceImpl implements AlumnoService {

    private final AlumnoRepository alumnoRepo;
    private final CursoRepository cursoRepo;

    @Override
    public List<Alumno> listar() {
        return alumnoRepo.findAll();
    }

    @Override
    public Alumno buscar(String cedula) {
        return alumnoRepo.findById(cedula).orElseThrow();
    }

    @Override
    public Alumno crear(AlumnoCreateDto dto) {

        Curso curso = null;
        if (dto.cursoId() != null)
            curso = cursoRepo.findById(dto.cursoId()).orElseThrow();

        Alumno a = Alumno.builder()
                .estCed(dto.estCed())
                .estNom(dto.estNom())
                .estApe(dto.estApe())
                .estTel(dto.estTel())
                .estDir(dto.estDir())
                .curso(curso)
                .build();

        return alumnoRepo.save(a);
    }

    @Override
    public Alumno actualizar(String cedula, AlumnoUpdateDto dto) {
        Alumno a = buscar(cedula);

        a.setEstNom(dto.estNom());
        a.setEstApe(dto.estApe());
        a.setEstDir(dto.estDir());
        a.setEstTel(dto.estTel());

        if (dto.cursoId() != null)
            a.setCurso(cursoRepo.findById(dto.cursoId()).orElseThrow());

        return alumnoRepo.save(a);
    }

    @Override
    public void eliminar(String cedula) {
        alumnoRepo.deleteById(cedula);
    }

    @Override
    public Curso obtenerCurso(String cedula) {
        return buscar(cedula).getCurso();
    }
}
