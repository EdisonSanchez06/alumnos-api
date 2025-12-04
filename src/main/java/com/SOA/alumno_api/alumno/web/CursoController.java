package com.soa.alumno_api.alumno.web;

import com.soa.alumno_api.alumno.dto.CursoCreateDTO;
import com.soa.alumno_api.alumno.dto.CursoResponseDTO;
import com.soa.alumno_api.alumno.dto.CursoUpdateDTO;
import com.soa.alumno_api.alumno.dto.*;
import com.soa.alumno_api.alumno.service.CursoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cursos")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CursoController {

    private final CursoService cursoService;

    @PostMapping
    public ResponseEntity<CursoResponseDTO> crear(
            @Valid @RequestBody CursoCreateDTO dto
    ) {
        return ResponseEntity.ok(cursoService.crear(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CursoResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CursoUpdateDTO dto
    ) {
        return ResponseEntity.ok(cursoService.actualizar(id, dto));
    }

    @GetMapping
    public ResponseEntity<List<CursoResponseDTO>> listar() {
        return ResponseEntity.ok(cursoService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CursoResponseDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(cursoService.obtener(id));
    }

    @GetMapping("/alumno/{alumnoCed}")
    public ResponseEntity<List<CursoResponseDTO>> listarPorAlumno(
            @PathVariable String alumnoCed
    ) {
        return ResponseEntity.ok(cursoService.listarPorAlumno(alumnoCed));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        cursoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
