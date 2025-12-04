package com.SOA.alumnos_api.config;

import com.SOA.alumnos_api.auth.service.JpaUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JpaUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf(AbstractHttpConfigurer::disable);

        http.authorizeHttpRequests(auth -> auth
                // Recursos públicos (ajusta los nombres de archivos que tengas)
                .requestMatchers(
                        "/",
                        "/login.html",
                        "/registro.html",
                        "/css/**",
                        "/js/**",
                        "/app.js",
                        "/auth/register"
                ).permitAll()

                // ADMIN y SECRETARIA pueden acceder a alumnos
                .requestMatchers("/api/alumnos/**")
                .hasAnyRole("ADMIN", "SECRETARIA")

                // Solo ADMIN puede acceder a cursos
                .requestMatchers("/api/cursos/**")
                .hasRole("ADMIN")

                // Todo lo demás requiere estar autenticado
                .anyRequest().authenticated()
        );

        // Autenticación básica para empezar (frontend manda Authorization: Basic ...)
        http.httpBasic();

        http.authenticationProvider(daoAuthenticationProvider());

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
