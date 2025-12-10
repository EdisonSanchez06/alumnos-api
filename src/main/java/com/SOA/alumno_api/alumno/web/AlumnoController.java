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
@CrossOrigin(origins = {"*"})
@RequiredArgsConstructor
public class AlumnoController {

    private final AlumnoService service;

    @GetMapping
    public List<Alumno> listar() {
        return service.listar();
    }

    @GetMapping("/{cedula}")
    public Alumno obtener(@PathVariable String cedula) {
        return service.buscarPorCedula(cedula);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Alumno crear(@Valid @RequestBody AlumnoCreateDto dto) {
        return service.crear(dto);
    }

    @PutMapping("/{cedula}")
    public Alumno actualizar(@PathVariable String cedula,
                             @Valid @RequestBody AlumnoUpdateDto dto) {
        return service.actualizar(cedula, dto);
    }

    @DeleteMapping("/{cedula}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable String cedula) {
        service.eliminar(cedula);
    }

    // 🔹 Asignar un estudiante a un curso
    @PutMapping("/{cedula}/curso/{cursoId}")
    public Alumno asignarCurso(
            @PathVariable String cedula,
            @PathVariable Long cursoId
    ) {
        return service.asignarCurso(cedula, cursoId);
    }

    // 🔹 Consultar el curso al que pertenece un estudiante
    @GetMapping("/{cedula}/curso")
    public Curso cursoDeAlumno(@PathVariable String cedula) {
        return service.obtenerCursoDeAlumno(cedula);
    }
}
