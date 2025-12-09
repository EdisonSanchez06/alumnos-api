package com.soa.alumno_api.auth.web;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @GetMapping("/login")
    public ResponseEntity<?> login(Authentication auth) {

        String username = auth.getName();
        String role = auth.getAuthorities().iterator().next().getAuthority()
                .replace("ROLE_", "");

        return ResponseEntity.ok(
                Map.of(
                        "user", username,
                        "role", role
                )
        );
    }
}
