package com.soa.alumno_api.alumno.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoCreateDTO {
    private String nombre;
    private String alumnoCed; // aquí recibimos la cedula
}

