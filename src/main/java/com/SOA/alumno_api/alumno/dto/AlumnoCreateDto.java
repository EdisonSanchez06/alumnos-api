package com.soa.alumno_api.alumno.dto;

import jakarta.validation.constraints.NotBlank;

public record AlumnoCreateDto(
        @NotBlank String estCed,
        @NotBlank String estNom,
        @NotBlank String estApe,
        @NotBlank String estDir,
        @NotBlank String estTel
) {}
