package com.soa.alumno_api.alumno.service;

import com.soa.alumno_api.alumno.dto.CursoCreateDTO;
import com.soa.alumno_api.alumno.dto.CursoUpdateDTO;
import com.soa.alumno_api.alumno.entity.Alumno;
import com.soa.alumno_api.alumno.entity.Curso;
import com.soa.alumno_api.alumno.repo.AlumnoRepository;
import com.soa.alumno_api.alumno.repo.CursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CursoServiceImpl implements CursoService {

    private final CursoRepository cursoRepo;
    private final AlumnoRepository alumnoRepo;

    @Override
    public List<Curso> listar() {
        return cursoRepo.findAll();
    }

    @Override
    public Curso buscarPorId(Long id) {
        return cursoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
    }

    @Override
    public Curso crear(CursoCreateDTO dto) {

        String nombre = dto.getNombre().trim();
        String nivel = dto.getNivel().trim().toLowerCase(); // normalizar
        String paralelo = dto.getParalelo().trim().toUpperCase(); // normalizar

        // 🔥 VALIDACIÓN: evitar cursos duplicados
        if (cursoRepo.existsByNombreIgnoreCaseAndNivelIgnoreCaseAndParaleloIgnoreCase(
                nombre, nivel, paralelo)) {
            throw new RuntimeException("Ya existe un curso con ese nombre, nivel y paralelo.");
        }

        Curso c = Curso.builder()
                .nombre(nombre)
                .nivel(nivel)
                .paralelo(paralelo)
                .build();

        return cursoRepo.save(c);
    }

    @Override
    public Curso actualizar(Long id, CursoUpdateDTO dto) {

        Curso c = buscarPorId(id);

        String nombre = dto.getNombre().trim();
        String nivel = dto.getNivel().trim().toLowerCase();
        String paralelo = dto.getParalelo().trim().toUpperCase();

        // 🔥 VALIDACIÓN: evitar duplicados al editar
        if (cursoRepo.existsByNombreIgnoreCaseAndNivelIgnoreCaseAndParaleloIgnoreCaseAndIdNot(
                nombre, nivel, paralelo, id)) {
            throw new RuntimeException("Ya existe otro curso con ese nombre, nivel y paralelo.");
        }

        c.setNombre(nombre);
        c.setNivel(nivel);
        c.setParalelo(paralelo);

        return cursoRepo.save(c);
    }

    @Override
    public void eliminar(Long id) {
        Curso c = buscarPorId(id);

        long cant = alumnoRepo.countByCurso(c);
        if (cant > 0) {
            throw new RuntimeException("No se puede eliminar. El curso tiene alumnos asignados.");
        }

        cursoRepo.delete(c);
    }

    @Override
    public List<Alumno> listarEstudiantes(Long cursoId) {
        Curso c = buscarPorId(cursoId);
        return alumnoRepo.findByCurso(c);
    }
}
