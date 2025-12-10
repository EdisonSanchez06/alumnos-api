package com.soa.alumno_api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // ===============================
    // 🔑 PasswordEncoder
    // ===============================
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ===============================
    // 🔒 Security Rules
    // ===============================
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // ===========================================
                        // 🔓 Recursos públicos (frontend)
                        // ===========================================
                        .requestMatchers(
                                "/", "/index.html", "/login.html",
                                "/css/**", "/js/**", "/img/**",
                                "/assets/**", "/static/**", "/favicon.ico"
                        ).permitAll()

                        // ===========================================
                        // 🔐 Alumnos (CRUD completo)
                        // ADMIN y SECRETARIA pueden gestionar alumnos
                        // ===========================================
                        .requestMatchers("/api/alumnos/**")
                        .hasAnyRole("ADMIN", "SECRETARIA")

                        // ===========================================
                        // 📘 Cursos — accesos divididos
                        // ===========================================

                        // Lectura permitida a ambos roles
                        .requestMatchers(HttpMethod.GET, "/api/cursos/**")
                        .hasAnyRole("ADMIN", "SECRETARIA")

                        // Crear curso → solo ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/cursos/**")
                        .hasRole("ADMIN")

                        // Actualizar curso → solo ADMIN
                        .requestMatchers(HttpMethod.PUT, "/api/cursos/**")
                        .hasRole("ADMIN")

                        // Eliminar curso → solo ADMIN
                        .requestMatchers(HttpMethod.DELETE, "/api/cursos/**")
                        .hasRole("ADMIN")

                        // ===========================================
                        // Cualquier otra ruta → requiere login
                        // ===========================================
                        .anyRequest().authenticated()
                )

                .httpBasic(Customizer.withDefaults())
                .cors(cors -> cors.configure(http));

        return http.build();
    }
}
