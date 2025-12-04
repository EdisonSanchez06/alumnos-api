package com.SOA.alumnos_api.auth.web;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @GetMapping("/login")
    public ResponseEntity<?> login(Authentication auth) {

        String username = auth.getName();

        String role = auth.getAuthorities()
                .stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority) // "ROLE_ADMIN"
                .orElse("ROLE_USER");

        String simpleRole = role.replace("ROLE_", "").toLowerCase(); // "admin" o "secretaria"

        return ResponseEntity.ok(
                Map.of(
                        "user", username,
                        "role", simpleRole
                )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginPost(Authentication auth) {
        // mismo comportamiento, por si tu formulario hace POST
        return login(auth);
    }
}
