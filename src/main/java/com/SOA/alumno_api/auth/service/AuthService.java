package com.soa.alumno_api.auth.service;

import com.soa.alumno_api.auth.dto.RegisterRequest;
import com.soa.alumno_api.auth.entity.Rol;
import com.soa.alumno_api.auth.entity.Usuario;
import com.soa.alumno_api.auth.repo.UsuarioRepository;
import com.soa.alumno_api.alumno.repo.AlumnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final AlumnoRepository alumnoRepository;
    private final PasswordEncoder passwordEncoder;

    public String register(RegisterRequest req) {

        // Validar username único
        if (usuarioRepository.existsByUsername(req.getUsername())) {
            return "El usuario ya está registrado";
        }

        // Validar rol
        if (req.getRole() == null || req.getRole().isBlank()) {
            return "Debe indicar el rol (ADMIN o SECRETARIA)";
        }

        // Validar enum
        Rol rol;
        try {
            rol = Rol.valueOf(req.getRole().toUpperCase());
        } catch (Exception e) {
            return "Rol inválido. Solo ADMIN o SECRETARIA";
        }

        // Si el rol fuera USER, validar existencia del alumno (opcional)
        if (rol == Rol.USER) {
            if (req.getCedula() == null || req.getCedula().isBlank()) {
                return "Debe ingresar una cédula";
            }

            if (!alumnoRepository.existsByEstCed(req.getCedula())) {
                return "No existe un alumno con esa cédula";
            }
        }

        // Crear y guardar el usuario
        Usuario user = new Usuario();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(rol);
        user.setCedula(req.getCedula());

        usuarioRepository.save(user);

        return "Usuario registrado correctamente";
    }
}
