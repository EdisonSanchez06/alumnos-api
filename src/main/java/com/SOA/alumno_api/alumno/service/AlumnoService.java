package com.soa.alumno_api.alumno.service;

import com.soa.alumno_api.alumno.dto.AlumnoCreateDto;
import com.soa.alumno_api.alumno.dto.AlumnoUpdateDto;
import com.soa.alumno_api.alumno.entity.Alumno;
import com.soa.alumno_api.alumno.repo.AlumnoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlumnoService {

    private final AlumnoRepository repo;

    public AlumnoService(AlumnoRepository repo) {
        this.repo = repo;
    }

    // GET /api/alumnos
    public List<Alumno> listar() {
        return repo.findAll();
    }

    // GET /api/alumnos/{ced}
    public Alumno porCedula(String ced) {
        return repo.findById(ced)
                .orElseThrow(() -> new EntityNotFoundException("Alumno no encontrado: " + ced));
    }

    // POST /api/alumnos
    public Alumno crear(AlumnoCreateDto dto) {

        if (repo.existsByEstCed(dto.estCed())) {
            throw new IllegalArgumentException("Ya existe un alumno con cédula: " + dto.estCed());
        }

        Alumno a = new Alumno();
        a.setEstCed(dto.estCed());
        a.setEstNom(dto.estNom());
        a.setEstApe(dto.estApe());
        a.setEstDir(dto.estDir());
        a.setEstTel(dto.estTel());

        return repo.save(a);
    }

    // PUT /api/alumnos/{ced}
    public Alumno actualizar(String ced, AlumnoUpdateDto dto) {
        Alumno a = porCedula(ced);
        a.setEstNom(dto.estNom());
        a.setEstApe(dto.estApe());
        a.setEstDir(dto.estDir());
        a.setEstTel(dto.estTel());
        return repo.save(a);
    }

    // DELETE /api/alumnos/{ced}
    public void eliminar(String ced) {
        Alumno a = porCedula(ced);
        repo.delete(a);
    }

    // NUEVO: todos los alumnos de un curso
    // GET /api/alumnos/curso/{cursoId}
    public List<Alumno> listarPorCurso(Long cursoId) {
        return repo.findByCursoId(cursoId);
    }
}
