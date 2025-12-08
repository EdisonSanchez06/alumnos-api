package com.soa.alumno_api.alumno.web;

import com.soa.alumno_api.alumno.dto.AlumnoCreateDto;
import com.soa.alumno_api.alumno.dto.AlumnoUpdateDto;
import com.soa.alumno_api.alumno.entity.Alumno;
import com.soa.alumno_api.alumno.service.AlumnoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alumnos")
@CrossOrigin(origins = {"*"})
public class AlumnoController {

    private final AlumnoService service;

    public AlumnoController(AlumnoService service) {
        this.service = service;
    }

    // GET /api/alumnos
    @GetMapping
    public List<Alumno> listar() {
        return service.listar();
    }

    // GET /api/alumnos/{ced}
    @GetMapping("/{ced}")
    public Alumno porCedula(@PathVariable String ced) {
        return service.porCedula(ced);
    }

    // POST /api/alumnos
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Alumno crear(@Valid @RequestBody AlumnoCreateDto dto) {
        return service.crear(dto);
    }

    // PUT /api/alumnos/{ced}
    @PutMapping("/{ced}")
    public Alumno actualizar(@PathVariable String ced, @Valid @RequestBody AlumnoUpdateDto dto) {
        return service.actualizar(ced, dto);
    }

    // DELETE /api/alumnos/{ced}
    @DeleteMapping("/{ced}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable String ced) {
        service.eliminar(ced);
    }

    // NUEVO: todos los alumnos que pertenecen a un curso
    // GET /api/alumnos/curso/{cursoId}
    @GetMapping("/curso/{cursoId}")
    public List<Alumno> alumnosPorCurso(@PathVariable Long cursoId) {
        return service.listarPorCurso(cursoId);
    }
}
