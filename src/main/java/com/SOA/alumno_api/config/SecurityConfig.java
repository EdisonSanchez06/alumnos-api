package com.soa.alumno_api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // ===============================
                // 🔓 CSRF OFF (requerido para frontend)
                // ===============================
                .csrf(csrf -> csrf.disable())

                // ===============================
                // 🔐 AUTORIZACIÓN
                // ===============================
                .authorizeHttpRequests(auth -> auth

                        // RUTAS PÚBLICAS (HTML + STATIC)
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/login.html",
                                "/css/**",
                                "/js/**",
                                "/img/**",
                                "/assets/**",
                                "/static/**",
                                "/favicon.ico"
                        ).permitAll()

                        // ===============================
                        // ROLES SEGÚN REQUERIMIENTOS
                        // ===============================

                        // SECRETARIA y ADMIN → CRUD alumnos
                        .requestMatchers("/api/alumnos/**")
                        .hasAnyRole("ADMIN", "SECRETARIA")

                        // SOLO ADMIN → CRUD cursos
                        .requestMatchers("/api/cursos/**")
                        .hasRole("ADMIN")

                        // Cualquier otra ruta → requiere login
                        .anyRequest().authenticated()
                )

                // ===============================
                // 🔐 LOGIN BASIC
                // ===============================
                .httpBasic(Customizer.withDefaults())

                // ===============================
                // 🌎 CORS permitido (desde cualquier origen)
                // ===============================
                .cors(cors -> cors.configure(http));

        return http.build();
    }
}
