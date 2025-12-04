package com.SOA.alumnos_api.alumno.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoResponseDTO {

    private Long id;
    private String nombre;

    private String alumnoCed;            // <- obligatorio
    private String alumnoNombreCompleto;
}
