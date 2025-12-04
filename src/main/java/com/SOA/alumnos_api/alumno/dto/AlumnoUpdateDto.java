package com.SOA.alumnos_api.alumno.dto;

import jakarta.validation.constraints.NotBlank;

public record AlumnoUpdateDto(
        @NotBlank String estNom,
        @NotBlank String estApe,
        @NotBlank String estDir,
        @NotBlank String estTel
) {}