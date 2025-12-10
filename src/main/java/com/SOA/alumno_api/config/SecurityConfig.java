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

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // Páginas públicas
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

                        // ==========================
                        // ALUMNOS
                        // ==========================
                        .requestMatchers("/api/alumnos/**")
                        .hasAnyRole("ADMIN", "SECRETARIA")

                        // ==========================
                        // CURSOS
                        // ==========================
                        // GET accesible para secretaria y admin
                        .requestMatchers(HttpMethod.GET, "/api/cursos/**")
                        .hasAnyRole("ADMIN", "SECRETARIA")

                        // POST, PUT, DELETE solo admin
                        .requestMatchers("/api/cursos/**")
                        .hasRole("ADMIN")

                        // Auth obligatorio para todo lo demás
                        .anyRequest().authenticated()
                )

                .httpBasic(Customizer.withDefaults())
                .cors(cors -> cors.configure(http));

        return http.build();
    }
}
