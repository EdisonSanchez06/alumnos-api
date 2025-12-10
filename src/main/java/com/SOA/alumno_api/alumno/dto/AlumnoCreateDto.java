package com.soa.alumno_api.alumno.dto;

public record AlumnoCreateDto(
        String estCed,
        String estNom,
        String estApe,
        String estDir,
        String estTel,
        Long cursoId // asignación inicial
) {}
