package com.soa.alumno_api.alumno.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoUpdateDTO {
    @NotBlank
    private String nombre;

    @NotBlank
    private String nivel;

    @NotBlank
    private String paralelo;
}

