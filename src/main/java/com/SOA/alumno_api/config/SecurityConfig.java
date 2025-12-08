package com.soa.alumno_api.config;

import com.soa.alumno_api.auth.service.JpaUserDetailsService;
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
import org.springframework.security.config.Customizer;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JpaUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf(AbstractHttpConfigurer::disable);

        http.authorizeHttpRequests(auth -> auth
                // Páginas y recursos públicos
                .requestMatchers(
                        "/",
                        "/login.html",
                        "/registro.html",
                        "/index.html",
                        "/alumnos.html",
                        "/cursos.html",
                        "/styles.css",
                        "/app.js"
                ).permitAll()

                // Endpoints públicos de auth (si los usas)
                .requestMatchers("/api/auth/**").permitAll()

                // SECRETARIA y ADMIN pueden gestionar alumnos
                .requestMatchers("/api/alumnos/**").hasAnyRole("ADMIN", "SECRETARIA")

                // Solo ADMIN puede gestionar cursos
                .requestMatchers("/api/cursos/**").hasRole("ADMIN")

                // Cualquier otra cosa requiere estar autenticado
                .anyRequest().authenticated()
        );

        http.httpBasic(Customizer.withDefaults());
        http.authenticationProvider(authenticationProvider());

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
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
