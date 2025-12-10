package com.soa.alumno_api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // ===============================
    // 🔑 PasswordEncoder requerido
    // ===============================
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

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

                        .requestMatchers("/api/alumnos/**")
                        .hasAnyRole("ADMIN", "SECRETARIA")

                        .requestMatchers("/api/cursos/**")
                        .hasRole("ADMIN")

                        .anyRequest().authenticated()
                )

                .httpBasic(Customizer.withDefaults())

                .cors(cors -> cors.configure(http));

        return http.build();
    }
}
