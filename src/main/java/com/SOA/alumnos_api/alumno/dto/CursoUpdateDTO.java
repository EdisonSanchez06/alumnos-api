package com.SOA.alumnos_api.alumno.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoUpdateDTO {

    @NotBlank(message = "El nombre del curso es obligatorio")
    private String nombre;

    @NotNull(message = "La cedula del alumno es obligatorio")
    private String alumnoCed;
}
