package com.soa.alumno_api.alumno.web;

import com.soa.alumno_api.alumno.dto.CursoCreateDTO;
import com.soa.alumno_api.alumno.dto.CursoUpdateDTO;
import com.soa.alumno_api.alumno.entity.Curso;
import com.soa.alumno_api.alumno.service.CursoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/cursos")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CursoController {

    private final CursoService service;

    @GetMapping
    public List<CursoResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public CursoResponseDTO obtener(@PathVariable Long id) {
        return service.buscar(id);
    }

    @GetMapping("/{id}/alumnos")
    public List<?> alumnosDeCurso(@PathVariable Long id) {
        return service.listarEstudiantes(id);
    }

    @PostMapping
    public CursoResponseDTO crear(@RequestBody CursoCreateDTO dto) {
        return service.crear(dto);
    }

    @PutMapping("/{id}")
    public CursoResponseDTO actualizar(
            @PathVariable Long id,
            @RequestBody CursoUpdateDTO dto) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
