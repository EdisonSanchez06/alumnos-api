package com.soa.alumno_api.alumno.web;

import com.soa.alumno_api.alumno.dto.AlumnoCreateDto;
import com.soa.alumno_api.alumno.dto.AlumnoUpdateDto;
import com.soa.alumno_api.alumno.entity.Alumno;
import com.soa.alumno_api.alumno.entity.Curso;
import com.soa.alumno_api.alumno.service.AlumnoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/alumnos")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AlumnoController {

    private final AlumnoService service;

    @GetMapping
    public List<Alumno> listar() {
        return service.listar();
    }

    @GetMapping("/{ced}")
    public Alumno obtener(@PathVariable String ced) {
        return service.buscar(ced);
    }

    @GetMapping("/{ced}/curso")
    public Curso cursoDeAlumno(@PathVariable String ced) {
        return service.obtenerCurso(ced);
    }

    @PostMapping
    public Alumno crear(@RequestBody AlumnoCreateDto dto) {
        return service.crear(dto);
    }

    @PutMapping("/{ced}")
    public Alumno actualizar(
            @PathVariable String ced,
            @RequestBody AlumnoUpdateDto dto
    ) {
        return service.actualizar(ced, dto);
    }

    @DeleteMapping("/{ced}")
    public void eliminar(@PathVariable String ced) {
        service.eliminar(ced);
    }
}
