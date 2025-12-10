package com.soa.alumno_api.alumno.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CursoResponseDTO {
    private Long id;
    private String nombre;
    private String nivel;
    private String paralelo;
    private int totalEstudiantes;
}
