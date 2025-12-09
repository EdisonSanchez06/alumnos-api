package com.soa.alumno_api.alumno.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CursoResponseDTO {

    private Long id;
    private String nombre;
    private String nivel;
    private String paralelo;

    private int totalAlumnos; // útil para el dashboard
}
