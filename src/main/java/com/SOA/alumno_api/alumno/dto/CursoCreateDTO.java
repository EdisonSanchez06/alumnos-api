package com.soa.alumno_api.alumno.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CursoCreateDTO {

    @NotBlank
    private String nombre;

    @NotBlank
    private String nivel;

    @NotBlank
    private String paralelo;
}
