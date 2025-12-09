package com.soa.alumno_api.alumno.service;

import com.soa.alumno_api.alumno.dto.CursoCreateDTO;
import com.soa.alumno_api.alumno.dto.CursoUpdateDTO;
import com.soa.alumno_api.alumno.entity.Curso;
import com.soa.alumno_api.alumno.repo.CursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Service
@RequiredArgsConstructor
public class CursoServiceImpl implements CursoService {

    private final CursoRepository repo;

    @Override
    public List<Curso> listar() {
        return repo.findAll();
    }

    @Override
    public Curso buscarPorId(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
    }

    @Override
    public Curso crear(CursoCreateDTO dto) {
        Curso c = Curso.builder()
                .nombre(dto.getNombre())
                .nivel(dto.getNivel())
                .paralelo(dto.getParalelo())
                .build();

        return repo.save(c);
    }

    @Override
    public Curso actualizar(Long id, CursoUpdateDTO dto) {
        Curso c = buscarPorId(id);

        c.setNombre(dto.getNombre());
        c.setNivel(dto.getNivel());
        c.setParalelo(dto.getParalelo());

        return repo.save(c);
    }

    @Override
    public void eliminar(Long id) {
        if (!repo.existsById(id))
            throw new RuntimeException("Curso no existe");

        repo.deleteById(id);
    }
}
