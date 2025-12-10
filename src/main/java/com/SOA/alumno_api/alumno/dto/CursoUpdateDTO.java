package com.soa.alumno_api.alumno.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CursoUpdateDTO {
    private String nombre;
    private String nivel;
    private String paralelo;
}
