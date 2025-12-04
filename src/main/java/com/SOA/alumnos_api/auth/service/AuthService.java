package com.SOA.alumnos_api.auth.service;

import com.SOA.alumnos_api.auth.dto.RegisterRequest;
import com.SOA.alumnos_api.auth.entity.Rol;
import com.SOA.alumnos_api.auth.entity.Usuario;
import com.SOA.alumnos_api.auth.repo.UsuarioRepository;
import com.SOA.alumnos_api.alumno.repo.AlumnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final AlumnoRepository alumnoRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Registro de usuario
     */
    public String register(RegisterRequest req) {

        // 1. Validar si ya existe username
        if (usuarioRepository.existsByUsername(req.getUsername())) {
            return "El usuario ya está registrado";
        }

        // 2. Validar rol
        if (req.getRole() == null || req.getRole().isBlank()) {
            return "Debe indicar el rol";
        }

        // 3. Validar estudiante
        if (req.getRole().equalsIgnoreCase("USER")) {

            if (req.getCedula() == null || req.getCedula().isBlank()) {
                return "Debe ingresar una cédula";
            }

            boolean existeAlumno = alumnoRepository.existsByEstCed(req.getCedula());

            if (!existeAlumno) {
                return "No existe un alumno con esa cédula";
            }
        }

        // 4. Crear entidad
        Usuario user = new Usuario();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(Rol.valueOf(req.getRole()));
        user.setCedula(req.getCedula());

        // 5. Guardar
        usuarioRepository.save(user);

        return "Usuario registrado correctamente";
    }
}
