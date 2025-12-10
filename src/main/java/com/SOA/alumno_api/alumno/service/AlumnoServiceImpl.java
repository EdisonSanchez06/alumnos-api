package com.soa.alumno_api.alumno.service;

import com.soa.alumno_api.alumno.dto.AlumnoCreateDto;
import com.soa.alumno_api.alumno.dto.AlumnoUpdateDto;
import com.soa.alumno_api.alumno.entity.Alumno;
import com.soa.alumno_api.alumno.entity.Curso;
import com.soa.alumno_api.alumno.repo.AlumnoRepository;
import com.soa.alumno_api.alumno.repo.CursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
    public Alumno buscarPorCedula(String cedula) {
        return alumnoRepo.findById(cedula)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));
    }

    @Override
    public Alumno crear(AlumnoCreateDto dto) {
        if (alumnoRepo.existsById(dto.estCed())) {
            throw new RuntimeException("Ya existe un alumno con esa cédula");
        }

        Alumno a = new Alumno();
        a.setEstCed(dto.estCed());
        a.setEstNom(dto.estNom());
        a.setEstApe(dto.estApe());
        a.setEstDir(dto.estDir());
        a.setEstTel(dto.estTel());

        // Se crea sin curso asignado inicialmente
        a.setCurso(null);

        return alumnoRepo.save(a);
    }

    @Override
    public Alumno actualizar(String cedula, AlumnoUpdateDto dto) {

        Alumno a = buscarPorCedula(cedula);

        a.setEstNom(dto.estNom());
        a.setEstApe(dto.estApe());
        a.setEstDir(dto.estDir());
        a.setEstTel(dto.estTel());

        return alumnoRepo.save(a);
    }

    @Override
    public void eliminar(String cedula) {
        Alumno a = buscarPorCedula(cedula);
        alumnoRepo.delete(a);
    }

    @Override
    public Alumno asignarCurso(String cedula, Long cursoId) {

        Alumno a = buscarPorCedula(cedula);

        Curso c = cursoRepo.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        a.setCurso(c);

        return alumnoRepo.save(a);
    }

    @Override
    public Curso obtenerCursoDeAlumno(String cedula) {
        Alumno a = buscarPorCedula(cedula);
        return a.getCurso();
    }
}
