package com.soa.alumno_api.auth.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    private String username;
    private String password;
    private String role; // "ADMIN" o "USER"
    private String cedula; // <-- AGREGAR ESTO
}
