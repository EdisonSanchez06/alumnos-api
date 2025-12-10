package com.soa.alumno_api.alumno.dto;

public record AlumnoUpdateDto(
        String estNom,
        String estApe,
        String estDir,
        String estTel,
        Long cursoId
) {}
